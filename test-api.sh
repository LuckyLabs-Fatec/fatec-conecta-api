#!/bin/bash

# Test script for Fatec Conecta API
# This script demonstrates all CRUD operations and role-based access control

BASE_URL="http://localhost:3000"

echo "======================================"
echo "Fatec Conecta API - Test Script"
echo "======================================"
echo ""

# Test 1: Register Users
echo "1. Registering users with different roles..."
echo "   - Registering Community user..."
curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"community1","email":"community@test.com","password":"pass123","role":"Community"}' | python3 -m json.tool

echo "   - Registering Staff-Admin user..."
curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","email":"admin@test.com","password":"pass123","role":"Staff-Admin"}' | python3 -m json.tool

echo "   - Registering Student user..."
curl -s -X POST $BASE_URL/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","email":"student@test.com","password":"pass123","role":"Student"}' | python3 -m json.tool

echo ""

# Test 2: Login as Community user
echo "2. Testing Authentication - Login as Community user..."
curl -s -c /tmp/community_session.txt -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"community1","password":"pass123"}' | python3 -m json.tool

echo ""

# Test 3: Create Idea (Community only)
echo "3. Testing Ideas - Community user creates an idea..."
curl -s -b /tmp/community_session.txt -X POST $BASE_URL/api/ideas \
  -H "Content-Type: application/json" \
  -d '{"title":"Mobile Campus App","description":"An app to help students navigate campus"}' | python3 -m json.tool

echo ""

# Test 4: Try to create idea as Student (should fail)
echo "4. Testing Authorization - Student tries to create idea (should fail)..."
curl -s -c /tmp/student_session.txt -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"student1","password":"pass123"}' > /dev/null

curl -s -b /tmp/student_session.txt -X POST $BASE_URL/api/ideas \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Idea","description":"Should fail"}' | python3 -m json.tool

echo ""

# Test 5: Login as Staff-Admin
echo "5. Testing Projects - Login as Staff-Admin..."
curl -s -c /tmp/admin_session.txt -X POST $BASE_URL/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin1","password":"pass123"}' | python3 -m json.tool

echo ""

# Test 6: Create Project without Idea (Staff only)
echo "6. Staff-Admin creates project without idea..."
curl -s -b /tmp/admin_session.txt -X POST $BASE_URL/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"WiFi Infrastructure Upgrade","description":"Upgrade campus WiFi"}' | python3 -m json.tool

echo ""

# Test 7: Create Project from Idea
echo "7. Staff-Admin creates project from existing idea..."
curl -s -b /tmp/admin_session.txt -X POST $BASE_URL/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Campus Navigation System","description":"Implementing the mobile app idea","ideaId":1}' | python3 -m json.tool

echo ""

# Test 8: Student tries to create project (should fail)
echo "8. Testing Authorization - Student tries to create project (should fail)..."
curl -s -b /tmp/student_session.txt -X POST $BASE_URL/api/projects \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Project","description":"Should fail"}' | python3 -m json.tool

echo ""

# Test 9: List all entities
echo "9. Retrieving all data..."
echo "   === Users ===="
curl -s -b /tmp/admin_session.txt $BASE_URL/api/users | python3 -m json.tool

echo ""
echo "   === Ideas ===="
curl -s -b /tmp/admin_session.txt $BASE_URL/api/ideas | python3 -m json.tool

echo ""
echo "   === Projects ===="
curl -s -b /tmp/admin_session.txt $BASE_URL/api/projects | python3 -m json.tool

echo ""

# Test 10: Update operations
echo "10. Testing Updates..."
echo "    - Updating idea..."
curl -s -b /tmp/community_session.txt -X PUT $BASE_URL/api/ideas/1 \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated: Mobile Campus App"}' | python3 -m json.tool

echo "    - Updating project..."
curl -s -b /tmp/admin_session.txt -X PUT $BASE_URL/api/projects/1 \
  -H "Content-Type: application/json" \
  -d '{"description":"Enhanced WiFi infrastructure with 5G support"}' | python3 -m json.tool

echo ""

# Test 11: Test authentication protection
echo "11. Testing Authentication Protection - Try to access without login..."
curl -s $BASE_URL/api/users | python3 -m json.tool

echo ""

# Test 12: Logout
echo "12. Testing Logout..."
curl -s -b /tmp/admin_session.txt -X POST $BASE_URL/api/users/logout | python3 -m json.tool

echo ""
echo "======================================"
echo "All tests completed!"
echo "======================================"
