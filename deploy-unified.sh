#!/bin/bash

echo "🚀 Deploy Unified API Gateway Setup"
echo "==================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

REGION="ap-south-1"

print_status "🎯 What this deployment creates:"
echo "==============================="
echo "✨ ONE API Gateway URL with:"
echo "   📍 /stage/* endpoints → Staging database"
echo "   📍 /prod/* endpoints → Production database"
echo ""
echo "Example URLs you'll get:"
echo "  https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod/stage/userSignIn"
echo "  https://xxxxxxxx.execute-api.ap-south-1.amazonaws.com/Prod/prod/userSignIn"
echo ""

read -p "Do you want to proceed with unified deployment? (yes/no): " proceed

if [ "$proceed" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

# Check if we need to generate the template
if [ ! -f "template.yaml" ]; then
    print_status "Generating unified template..."
    ./generate-unified-template.sh
fi

# # Auto-update VPC and subnet information
# print_status "Auto-updating VPC and subnet information..."

# # Get VPC and subnets (reuse from existing working templates)
# VPC_ID=$(grep -o 'VpcId: vpc-[a-z0-9]*' template-stage-fixed.yaml | head -1 | cut -d' ' -f2)
# SUBNET1=$(grep -o 'subnet-[a-z0-9]*' template-stage-fixed.yaml | head -1)
# SUBNET2=$(grep -o 'subnet-[a-z0-9]*' template-stage-fixed.yaml | tail -1)

# if [ "$VPC_ID" != "" ] && [ "$SUBNET1" != "" ] && [ "$SUBNET2" != "" ]; then
#     print_success "Found VPC info from existing templates:"
#     echo "  VPC: $VPC_ID"
#     echo "  Subnet 1: $SUBNET1"
#     echo "  Subnet 2: $SUBNET2"
    
#     # Update the unified template
#     sed -i '' "s/vpc-12345678/$VPC_ID/g" template.yaml
#     sed -i '' "s/subnet-12345678/$SUBNET1/g" template.yaml
#     sed -i '' "s/subnet-87654321/$SUBNET2/g" template.yaml
    
#     print_success "Updated unified template with VPC information"
# else
#     print_error "Could not find VPC information from existing templates"
#     echo "Please run: ./find-vpc-info.sh first"
#     exit 1
# fi

print_warning "⚠️  Important Notes:"
echo "==================="
echo "1. This will create NEW databases (different from your current ones)"
echo "2. You'll need to migrate data from existing databases if needed"
echo "3. This creates 40 Lambda functions (20 for stage + 20 for prod)"
echo "4. Your current separate stacks will remain untouched"
echo ""

read -p "Continue with deployment? (yes/no): " final_confirm

if [ "$final_confirm" != "yes" ]; then
    echo "Deployment cancelled."
    exit 0
fi

print_status "Building unified template..."
sam build --template-file template.yaml --config-file samconfig.toml

if [ $? -eq 0 ]; then
    print_success "Build successful!"
    print_status "Deploying unified stack..."
    
    sam deploy --config-file samconfig.toml
    
    if [ $? -eq 0 ]; then
        print_success "🎉 Unified deployment successful!"
        
        # Get the API Gateway URL
        API_URL=$(aws cloudformation describe-stacks --stack-name emp-backend-unified --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`UnifiedApiGatewayUrl`].OutputValue' --output text 2>/dev/null)
        STAGE_DB=$(aws cloudformation describe-stacks --stack-name emp-backend-unified --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`StageDatabaseEndpoint`].OutputValue' --output text 2>/dev/null)
        PROD_DB=$(aws cloudformation describe-stacks --stack-name emp-backend-unified --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`ProductionDatabaseEndpoint`].OutputValue' --output text 2>/dev/null)
        
        echo ""
        echo "🌟 UNIFIED API GATEWAY DEPLOYED! 🌟"
        echo "=================================="
        
        if [ "$API_URL" != "" ]; then
            echo ""
            print_success "🔗 Your Single API Gateway URL:"
            echo "    $API_URL"
            echo ""
            print_status "📍 Stage Endpoints (Staging Database):"
            echo "    ${API_URL}/stage/userSignIn"
            echo "    ${API_URL}/stage/manageDonor"
            echo "    ${API_URL}/stage/manageNGO"
            echo "    ${API_URL}/stage/manageDonations"
            echo "    (... all 20 functions under /stage/)"
            echo ""
            print_status "📍 Production Endpoints (Production Database):"
            echo "    ${API_URL}/prod/userSignIn"
            echo "    ${API_URL}/prod/manageDonor"
            echo "    ${API_URL}/prod/manageNGO"
            echo "    ${API_URL}/prod/manageDonations"
            echo "    (... all 20 functions under /prod/)"
        fi
        
        echo ""
        print_status "🗃️ Database Information:"
        if [ "$STAGE_DB" != "" ]; then
            echo "  Stage DB: $STAGE_DB (empbackendstage)"
        fi
        if [ "$PROD_DB" != "" ]; then
            echo "  Prod DB: $PROD_DB (empbackendprod)"
        fi
        
        echo ""
        print_status "🎯 What you achieved:"
        echo "   ✅ Single API Gateway URL"
        echo "   ✅ /stage/* routes → Staging database"
        echo "   ✅ /prod/* routes → Production database"
        echo "   ✅ Complete environment separation"
        echo "   ✅ Same codebase, different data"
        
        echo ""
        print_warning "📋 Next Steps:"
        echo "1. Test both environments:"
        echo "   curl -X POST ${API_URL}/stage/userSignIn"
        echo "   curl -X POST ${API_URL}/prod/userSignIn"
        echo ""
        echo "2. Update your frontend/client to use the new unified URL"
        echo ""
        echo "3. Migrate data from old databases if needed"
        echo ""
        echo "4. Consider deleting old separate stacks when ready:"
        echo "   aws cloudformation delete-stack --stack-name emp-backend-stage --region ap-south-1"
        echo "   aws cloudformation delete-stack --stack-name emp-backend-prod --region ap-south-1"
        
    else
        print_error "Deployment failed!"
        echo ""
        echo "Common issues:"
        echo "1. Check CloudFormation events in AWS Console"
        echo "2. Verify VPC/subnet configurations"
        echo "3. Check IAM permissions"
    fi
else
    print_error "Build failed!"
    echo ""
    echo "Check for syntax errors in template.yaml"
fi

echo ""
print_success "Deployment script complete! 🎉"