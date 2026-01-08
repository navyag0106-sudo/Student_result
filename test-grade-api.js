// Test API endpoints for grade validation

// Test data
const testCases = [
  {
    name: "Valid grade access - Student 731623102036",
    endpoint: "/api/students/validate-grade-access",
    data: {
      regNo: "731623102036",
      dob: "2026-01-10",
      year: "Year I",
      semester: "Sem 1"
    }
  },
  {
    name: "Valid grade access - Student 731623102032",
    endpoint: "/api/students/validate-grade-access",
    data: {
      regNo: "731623102032",
      dob: "2026-01-05",
      year: "Year II",
      semester: "Sem 1"
    }
  },
  {
    name: "Invalid DOB",
    endpoint: "/api/students/validate-grade-access",
    data: {
      regNo: "731623102036",
      dob: "2026-01-15", // Wrong DOB
      year: "Year I",
      semester: "Sem 1"
    }
  },
  {
    name: "Missing semester",
    endpoint: "/api/students/validate-grade-access",
    data: {
      regNo: "731623102036",
      dob: "2026-01-10",
      year: "Year I"
      // Missing semester
    }
  },
  {
    name: "Flexible verification (optional year/semester)",
    endpoint: "/api/students/verify",
    data: {
      regNo: "731623102036",
      dob: "2026-01-10",
      year: "Year I",
      semester: "Sem 1"
    }
  }
];

console.log("📋 Grade Validation API Test Cases");
console.log("=====================================");

testCases.forEach((test, index) => {
  console.log(`\n${index + 1}. ${test.name}`);
  console.log(`   POST ${test.endpoint}`);
  console.log(`   Body:`, JSON.stringify(test.data, null, 6));
});

console.log("\n🚀 To test these endpoints:");
console.log("1. Start your backend server");
console.log("2. Use curl, Postman, or any API client");
console.log("3. Send POST requests to the endpoints with the JSON bodies above");
console.log("\n📝 Expected Results:");
console.log("- Valid cases: Return student data with grades and validation confirmation");
console.log("- Invalid cases: Return appropriate error messages with status codes");
