
/**
 * This file contains the mock SCHEMA_DATA and related helpers.
 * Feel free to edit or expand, it's only used for development/demo purposes.
 */
export const rand = (arr: any[]) => arr[Math.floor(Math.random() * arr.length)];
export function range(n: number) {
  return Array.from({ length: n }, (_, i) => i + 1);
}
export function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const SCHEMA_DATA = [
  {
    schema: "public",
    tables: [
      {
        name: "users",
        columns: ["id", "name", "email", "created_at"],
        description: "All application users currently registered.",
        owner: "admin_account",
        rowsSample: range(30).map(i => [
          i + 1,
          rand([
            "Alice", "Bob", "Cathy", "David", "Erin", "Frank", "Gina", "Helen",
            "Ian", "Jane", "Kyle", "Lana", "Mike", "Nina", "Ola", "Paul",
            "Quinn", "Ray", "Sara", "Tom", "Uma", "Viktor", "Wendy", "Xander", "Yana", "Zack"
          ]),
          `user${i+1}@mail.com`,
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([
            10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
          ])).toString().padStart(2,"0")}`
        ]),
      },
      {
        name: "orders",
        columns: ["id", "user_id", "total", "date"],
        description: "Records of all purchases/orders made by users.",
        owner: "orders_ops",
        rowsSample: range(28).map(i => [
          i + 1,
          randInt(1, 30),
          `$${(rand([
            20,35,50,29,79,110,14,7,88,67,99,45,31,59
          ]) + Math.floor(Math.random()*10)).toFixed(2)}`,
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([
            10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
          ])).toString().padStart(2,"0")}`
        ]),
      },
      {
        name: "products",
        columns: ["id", "name", "price"],
        description: "Product catalog items.",
        owner: "shop_manager",
        rowsSample: range(22).map(i => [
          i + 1,
          rand([
            "Pen", "Notebook", "Mug", "Backpack", "T-Shirt", "Sticker", "Lamp", "Laptop",
            "Phone", "Desk", "Monitor", "Keyboard", "Mouse", "Chair", "Bottle", "Bag",
            "Headphones", "Book", "USB Stick", "Charger", "Tablet", "Speaker"
          ]),
          `$${(rand([5,20,15,99,49,150,79,9,22,57]) + Math.floor(Math.random()*10))}.00`,
        ]),
      },
      {
        name: "categories",
        columns: ["id", "title", "description"],
        description: "Product category organization.",
        owner: "shop_manager",
        rowsSample: range(15).map(i => [
          i + 1,
          rand([
            "Books", "Clothing", "Electronics", "Stationery", "Accessories", "Gadgets",
            "Homeware", "Promo", "Toys", "Drinkware", "Audio", "Attire", "Mobile", "Bags", "Tech"
          ]),
          "Sample category for organizing products",
        ]),
      },
    ],
  },
  {
    schema: "audit",
    tables: [
      {
        name: "logs",
        columns: ["id", "table", "user", "change_type", "date"],
        description: "Audit logs for changes to tables in the database.",
        owner: "security_team",
        rowsSample: range(35).map(i => [
          i + 1,
          rand(["users","orders","products","categories"]),
          rand(["auditor1","auditor2","admin","sysop","John","Ashley"]),
          rand(["INSERT","UPDATE","DELETE"]),
          `2023-0${rand([1,2,3,4,5,6,7,8,9])}-${(rand([
            10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
          ])).toString().padStart(2,"0")}`
        ]),
      },
    ],
  },
  {
    schema: "sales",
    tables: [
      {
        name: "invoices",
        columns: ["invoice_id", "customer", "total", "date_issued", "paid"],
        description: "All sales invoices in the system.",
        owner: "sales_team",
        rowsSample: range(25).map(i => [
          1000 + i,
          rand(["Alice Co.","Bravo LLC","Cathy Corp.","Delta Ltd.","Echo GmbH","Foxtrot Inc.","Golf SA","Hotel AG","India BV"]),
          `$${(rand([150,199,215,110,128,180]) + Math.floor(Math.random()*30)).toFixed(2)}`,
          `2024-0${rand([1,2,3,4,5,6])}-${(rand([
            10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29
          ])).toString().padStart(2,"0")}`,
          rand(["true","false"])
        ])
      },
      {
        name: "sales_reps",
        columns: ["rep_id", "name", "territory"],
        description: "Sales team staff list.",
        owner: "hr",
        rowsSample: range(12).map(i => [
          200 + i,
          rand(["Anna","Ben","Cara","Dustin","Ella","Fred","Gina","Harry","Ivy","Jen","Karl","Liam"]),
          rand(["North","East","South","West","Central"]),
        ])
      },
    ],
  },
  {
    schema: "analytics",
    tables: [
      {
        name: "pageviews",
        columns: ["event_id", "page", "user_id", "timestamp"],
        description: "Web analytics page view events.",
        owner: "analytics_bot",
        rowsSample: range(40).map(i => [
          9000 + i,
          rand(["/","/login","/dashboard","/profile","/orders","/about","/products","/categories"]),
          randInt(1, 30),
          `2024-04-${(randInt(1,27)).toString().padStart(2,"0")} 0${randInt(0,8)}:${rand(["05","15","22","38","42","57"])}:00`
        ])
      },
      {
        name: "funnels",
        columns: ["step_id", "step_name", "visits"],
        description: "Track user funnel steps and conversion.",
        owner: "analytics_bot",
        rowsSample: range(8).map(i => [
          i + 1,
          rand(["Landing","Sign Up","Email Entered","Payment","Onboarded","Trial","Upgrade","Churn"]),
          randInt(500,1000),
        ])
      },
    ],
  },
  {
    schema: "hr",
    tables: [
      {
        name: "employees",
        columns: ["emp_id", "name", "dept", "hire_date"],
        description: "Registered company employees.",
        owner: "hr_dept",
        rowsSample: range(38).map(i => [
          3000 + i,
          rand([
            "Alex","Barbara","Carlos","Diana","Eva","Frank","Grace","Hank","Irene","Jacob","Kate",
            "Leo","Maria","Ned","Olga","Peter","Quincy","Rita","Steve","Tina","Ulysses","Veronica","Will",
            "Xena","Yuri","Zora"
          ]),
          rand(["IT","Sales","HR","Finance","Legal","Analytics"]),
          `20${rand([11,12,13,14,15,16,17,18,19,20,21,22])}-0${randInt(1,8)}-${(randInt(1,27)).toString().padStart(2,"0")}`
        ])
      },
      {
        name: "departments",
        columns: ["dept_id", "dept_name", "manager"],
        description: "All business units.",
        owner: "hr_dept",
        rowsSample: range(6).map(i => [
          i + 1,
          rand(["HR","Sales","Finance","IT","Analytics","Legal"]),
          rand(["Yana","Ola","Paul","Grace","Ulysses","Tina","Leo"])
        ])
      }
    ],
  }
];
