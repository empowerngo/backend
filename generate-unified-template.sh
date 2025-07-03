#!/bin/bash

echo "🔄 Creating Unified API Template Generator"
echo "========================================"

# List of all your Lambda functions
FUNCTIONS=(
    "manageDonor"
    "manageNGO" 
    "manageProject"
    "managePurpose"
    "manageLeads"
    "manageUserRegistration"
    "retrieveUsersInfo"
    "retrieveNGOInfo"
    "manageDonations"
    "userSignIn"
    "manageSubsPackage"
    "retrieveSubsPackages"
    "retrieveDonorInfo"
    "importStatement"
    "retrieveStatementData"
    "retrieveDonations"
    "sendEmail"
    "retrieveForm10BDData"
    "retrieveDashBoardData"
    "retrieveUsageNPlanInfo"
)

# Generate Lambda function pairs for the template
generate_lambda_functions() {
    for func in "${FUNCTIONS[@]}"; do
        echo "
  # ${func} - Stage Environment
  ${func}Stage:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/${func}
      Handler: index.handler
      FunctionName: \"${func}-stage\"
      Description: \"${func} - STAGE\"
      Role: !GetAtt lambdaExecutionRole.Arn
      Events:
        Api:
          Type: Api
          Properties:
            Path: \"/stage/${func}\"
            Method: POST
      Environment:
        Variables:
          DB_HOST: !GetAtt StageDatabase.Endpoint.Address
          DB_NAME: !Ref StageDatabase
          DB_USER: !Ref StageDBUserName
          DB_PASSWORD: !Ref StageDBPassword
          DB_PORT: !GetAtt StageDatabase.Endpoint.Port
          ENVIRONMENT: \"stage\"
          EMAIL_USER: \"teamtech993@gmail.com\"
          EMAIL_PASS: \"Tech@2468\"
          ADMIN_EMAIL: \"jeeva7777@gmail.com\"
          EMAIL_SERVICE: \"gmail\"
          NODE_ENV: \"stage\"
          LIMIT: 20
          JWT_SECRET_PARAM: \"/emp-backend/jwt-secret\"" 
          
        # Add special environment variables for sendEmail
        if [ "$func" = "sendEmail" ]; then
            echo "          SMTP_USER: \"support@empowerngo.com\"
          SMTP_PASS: \"EmpTech#25\""
        fi
        
        echo "      Runtime: nodejs18.x
      MemorySize: 256
      Timeout: 60
      Layers:
        - !Ref CommonLayer
    Metadata:
      BuildMethod: nodejs18.x

  # ${func} - Production Environment  
  ${func}Prod:
    Type: AWS::Serverless::Function
    Properties:
      CodeUri: src/handlers/${func}
      Handler: index.handler
      FunctionName: \"${func}-prod\"
      Description: \"${func} - PRODUCTION\"
      Role: !GetAtt lambdaExecutionRole.Arn
      Events:
        Api:
          Type: Api
          Properties:
            Path: \"/prod/${func}\"
            Method: POST
      Environment:
        Variables:
          DB_HOST: !GetAtt ProductionDatabase.Endpoint.Address
          DB_NAME: !Ref ProductionDatabase
          DB_USER: !Ref ProdDBUserName
          DB_PASSWORD: !Ref ProdDBPassword
          DB_PORT: !GetAtt ProductionDatabase.Endpoint.Port
          ENVIRONMENT: \"prod\"
          EMAIL_USER: \"teamtech993@gmail.com\"
          EMAIL_PASS: \"Tech@2468\"
          ADMIN_EMAIL: \"jeeva7777@gmail.com\"
          EMAIL_SERVICE: \"gmail\"
          NODE_ENV: \"production\"
          LIMIT: 20
          JWT_SECRET_PARAM: \"/emp-backend/jwt-secret\""
          
        # Add special environment variables for sendEmail
        if [ "$func" = "sendEmail" ]; then
            echo "          SMTP_USER: \"support@empowerngo.com\"
          SMTP_PASS: \"EmpTech#25\""
        fi
        
        echo "      Runtime: nodejs18.x
      MemorySize: 256
      Timeout: 60
      Layers:
        - !Ref CommonLayer
    Metadata:
      BuildMethod: nodejs18.x"
    done
}

echo "Generating complete unified template..."

# Create the complete template
cat > template.yaml << 'EOF'
# Unified Template - Single API Gateway with Stage and Prod Paths
AWSTemplateFormatVersion: 2010-09-09
Transform:
  - AWS::Serverless-2016-10-31
Description: >-
  khana-backend-unified - Single API with /stage and /prod paths

Parameters:
  StageDBUserName:
    Description: "Stage database username"
    Type: "String"
    Default: "stageusr"
    NoEcho: false
  StageDBPassword:
    Description: "Stage database password"
    Type: "String"
    Default: "StagePass2025!"
    NoEcho: true
  ProdDBUserName:
    Description: "Production database username"
    Type: "String"
    Default: "produsr"
    NoEcho: false
  ProdDBPassword:
    Description: "Production database password"
    Type: "String"
    Default: "ProdPass2025!"
    NoEcho: true

Globals:
  Api:
    Cors:
      AllowHeaders: "'*'"
      AllowMethods: "'GET,POST, PUT, OPTIONS'" 
      AllowOrigin: "'*'"

Resources:
  # Stage RDS Database
  StageDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: emp-backend-stage-db-unified
      DBName: empbackendstage
      DBInstanceClass: db.t3.micro
      Engine: mysql
      EngineVersion: '8.0.35'
      MasterUsername: !Ref StageDBUserName
      MasterUserPassword: !Ref StageDBPassword
      AllocatedStorage: 20
      StorageType: gp2
      BackupRetentionPeriod: 7
      DeletionProtection: true
      StorageEncrypted: true
      Tags:
        - Key: Environment
          Value: stage
        - Key: Name
          Value: emp-backend-stage-database

  # Production RDS Database
  ProductionDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceIdentifier: emp-backend-prod-db-unified
      DBName: empbackendprod
      DBInstanceClass: db.t3.small
      Engine: mysql
      EngineVersion: '8.0.35'
      MasterUsername: !Ref ProdDBUserName
      MasterUserPassword: !Ref ProdDBPassword
      AllocatedStorage: 100
      StorageType: gp2
      BackupRetentionPeriod: 30
      DeletionProtection: true
      StorageEncrypted: true
      MultiAZ: true
      Tags:
        - Key: Environment
          Value: prod
        - Key: Name
          Value: emp-backend-prod-database

  # IAM Role for Lambda
  lambdaExecutionRole:
    Type: AWS::IAM::Role
    Properties:
      RoleName: "emp-backend-unified-lambda-role"
      ManagedPolicyArns:
        - arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
        - arn:aws:iam::aws:policy/SecretsManagerReadWrite
        - arn:aws:iam::aws:policy/service-role/AWSLambdaRole
        - arn:aws:iam::aws:policy/AWSLambdaExecute
        - arn:aws:iam::aws:policy/AmazonS3FullAccess
      AssumeRolePolicyDocument:
        Version: "2012-10-17"
        Statement:
          - Effect: Allow
            Principal:
              Service:
                - lambda.amazonaws.com
            Action:
              - sts:AssumeRole
      Policies:
        - PolicyName: SSMParameterAccess
          PolicyDocument:
            Version: "2012-10-17"
            Statement:
              - Effect: Allow
                Action: 
                  - ssm:GetParameter
                  - ssm:GetParameters
                Resource: 
                  - "arn:aws:ssm:ap-south-1:*:parameter/emp-backend/*"

  # Common Layer
  CommonLayer:
    Type: AWS::Serverless::LayerVersion
    Properties:
      LayerName: "common-layer-unified"
      Description: Code shared across all lambda functions
      ContentUri: src/layers/common-layer
      CompatibleRuntimes:
        - nodejs18.x
      RetentionPolicy: Delete
    Metadata:
      BuildMethod: makefile
EOF

# Add all Lambda functions
generate_lambda_functions >> template.yaml

# Add the outputs section
cat >> template.yaml << 'EOF'

Outputs:
  UnifiedApiGatewayUrl:
    Description: "Unified API Gateway endpoint URL"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod"
    Export:
      Name: !Sub "${AWS::StackName}-ApiGatewayUrl"
  
  StageApiExample:
    Description: "Example Stage API endpoint"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/stage/userSignIn"
    Export:
      Name: !Sub "${AWS::StackName}-StageApiExample"
      
  ProdApiExample:
    Description: "Example Production API endpoint"
    Value: !Sub "https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/prod/userSignIn"
    Export:
      Name: !Sub "${AWS::StackName}-ProdApiExample"
  
  StageDatabaseEndpoint:
    Description: "Stage database endpoint"
    Value: !GetAtt StageDatabase.Endpoint.Address
    Export:
      Name: !Sub "${AWS::StackName}-StageDatabaseEndpoint"
  
  ProductionDatabaseEndpoint:
    Description: "Production database endpoint"
    Value: !GetAtt ProductionDatabase.Endpoint.Address
    Export:
      Name: !Sub "${AWS::StackName}-ProductionDatabaseEndpoint"

  AllStageEndpoints:
    Description: "All Stage API endpoints"
    Value: !Sub |
      Stage Endpoints (All point to staging database):
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/stage/manageDonor
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/stage/manageNGO
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/stage/userSignIn
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/stage/manageDonations
      (... and all other functions under /stage/)

  AllProdEndpoints:
    Description: "All Production API endpoints"
    Value: !Sub |
      Production Endpoints (All point to production database):
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/prod/manageDonor
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/prod/manageNGO
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/prod/userSignIn
      https://${ServerlessRestApi}.execute-api.${AWS::Region}.amazonaws.com/Prod/prod/manageDonations
      (... and all other functions under /prod/)
EOF

echo "✅ Complete unified template generated: template.yaml"
echo ""
echo "📝 Summary of what this creates:"
echo "================================"
echo "🔗 ONE API Gateway URL with paths:"
echo "   /stage/* → Points to staging database"
echo "   /prod/* → Points to production database"
echo ""
echo "🗃️ TWO separate databases:"
echo "   - empbackendstage (staging data)"
echo "   - empbackendprod (production data)"
echo ""
echo "⚡ $(( ${#FUNCTIONS[@]} * 2 )) Lambda functions total:"
echo "   - ${#FUNCTIONS[@]} functions with /stage/ paths"
echo "   - ${#FUNCTIONS[@]} functions with /prod/ paths"
echo ""
echo "🎯 Result: One URL, two environments!"
echo ""

TOTAL_FUNCTIONS=$(( ${#FUNCTIONS[@]} * 2 ))
echo "📊 Function count: $TOTAL_FUNCTIONS Lambda functions will be created"
echo "💰 Cost note: This creates more Lambda functions but only one API Gateway"