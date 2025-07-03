#!/bin/bash

echo "🔧 Fix Database Identifier Conflict"
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

print_status "The deployment failed because database identifiers already exist."
echo ""

# Check what RDS instances currently exist
print_status "Checking existing RDS instances..."
aws rds describe-db-instances --region $REGION --query 'DBInstances[?contains(DBInstanceIdentifier, `emp-backend`)].{ID:DBInstanceIdentifier, Status:DBInstanceStatus}' --output table

echo ""
print_status "🚀 Quick Fix: Using unique database identifiers"
echo ""

# Generate unique suffix
TIMESTAMP=$(date +%s)

print_status "Updating template with unique database identifiers (timestamp: $TIMESTAMP)..."

# Update the template with unique identifiers
sed -i '' "s/emp-backend-stage-db-unified/emp-backend-stage-db-uni-${TIMESTAMP}/g" template.yaml
sed -i '' "s/emp-backend-prod-db-unified/emp-backend-prod-db-uni-${TIMESTAMP}/g" template.yaml

print_success "Updated database identifiers"

# Clean up the failed stack first
print_status "Cleaning up failed stack..."
aws cloudformation delete-stack --stack-name emp-backend-unified --region $REGION

print_status "Waiting for stack deletion..."
aws cloudformation wait stack-delete-complete --stack-name emp-backend-unified --region $REGION

print_success "Stack deleted. Ready for fresh deployment."

print_status "Deploying with unique database identifiers..."
sam build --template-file template.yaml --config-file samconfig.toml

if [ $? -eq 0 ]; then
    sam deploy --config-file samconfig.toml
    
    if [ $? -eq 0 ]; then
        print_success "🎉 Unified deployment successful with unique database identifiers!"
        
        # Get the API Gateway URL
        API_URL=$(aws cloudformation describe-stacks --stack-name emp-backend-unified --region $REGION --query 'Stacks[0].Outputs[?OutputKey==`UnifiedApiGatewayUrl`].OutputValue' --output text 2>/dev/null)
        
        echo ""
        echo "🌟 UNIFIED API GATEWAY DEPLOYED! 🌟"
        echo "=================================="
        
        if [ "$API_URL" != "" ]; then
            echo ""
            print_success "🔗 Your Single API Gateway URL:"
            echo "    $API_URL"
            echo ""
            print_status "📍 Test your endpoints:"
            echo "    Stage:  ${API_URL}/stage/userSignIn"
            echo "    Prod:   ${API_URL}/prod/userSignIn"
            echo ""
            print_status "📍 All available paths:"
            echo "    ${API_URL}/stage/* → Staging Database"
            echo "    ${API_URL}/prod/*  → Production Database"
        fi
        
        echo ""
        print_success "✅ SUCCESS! You now have ONE API URL with /stage and /prod paths!"
        echo ""
        print_status "🎯 What you achieved:"
        echo "   ✅ Single API Gateway URL"
        echo "   ✅ Path-based environment routing"
        echo "   ✅ Separate databases for each environment"
        echo "   ✅ Complete isolation between stage and prod"
        
    else
        print_error "Deployment still failed. Check CloudFormation events for details."
    fi
else
    print_error "Build failed."
fi

echo ""
print_success "Fix script complete! 🎉"
