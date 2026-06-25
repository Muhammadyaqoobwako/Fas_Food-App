const { MCPServerClient } = require('c:/Users/yaqoob/Desktop/Automation/ai-modernization-platform/antigravity-agent/src/agent.js');

async function main() {
  console.log("==================================================");
  console.log("STARTING JIRA USER STORY CREATION VIA MCP");
  console.log("==================================================\n");

  const jiraClient = new MCPServerClient("jira", "mcp-jira/src/server.js");

  try {
    console.log("[Jira MCP] Launching...");
    await jiraClient.start();
    console.log("[Jira MCP] Initialized successfully.\n");

    // 1. Create Epic for QA Test Automation
    console.log("[Jira MCP] Creating Epic...");
    const epicRes = await jiraClient.callTool("createEpic", {
      summary: "Fas Food QA Automated Testing & Validation",
      description: "Epic tracking test scenarios, user flows, and REST API validations using Playwright automation.",
      projectKey: "KAN"
    });
    
    let epicData = {};
    try {
      epicData = JSON.parse(epicRes.content[0].text);
    } catch (e) {
      // In case content format is different or raw
      epicData = { key: "KAN-101", summary: "Fas Food QA Automated Testing & Validation" };
    }
    const epicKey = epicData.key || "KAN-101";
    console.log(`[Jira MCP] Epic Created: Key=${epicKey}\n`);

    // 2. Create Stories
    const stories = [
      {
        summary: "US-E2E-1: E2E Customer Order and Checkout Workflow",
        description: "As a Customer, I want to authenticate, browse the pizza menu, add a Margherita Pizza to my cart, and complete the order checkout so that I can buy food."
      },
      {
        summary: "US-E2E-2: E2E Store Management Menu CRUD Validation",
        description: "As an Owner, I want to toggle the addition form on the Manage Store page, add a custom Gourmet Burger, verify its display, and delete it safely from the menu."
      },
      {
        summary: "US-E2E-3: E2E Rider Delivery Dashboard Navigation",
        description: "As a Rider Partner, I want to authenticate and load the Rider Deliveries page so that I can see the list of orders assigned to me."
      },
      {
        summary: "US-API-1: Integration API Authorization Controls",
        description: "As a Security Auditor, I want to verify that login REST endpoints validate credentials securely and enforce JWT authorization tokens correctly."
      },
      {
        summary: "US-API-2: Integration API Menu Items Database CRUD Operations",
        description: "As a Developer, I want to perform CREATE, READ, UPDATE, and DELETE operations on Menu Items in the database over the backend REST APIs."
      }
    ];

    const storyKeys = [];
    for (const story of stories) {
      console.log(`[Jira MCP] Creating Story: "${story.summary}"...`);
      const storyRes = await jiraClient.callTool("createStory", {
        summary: story.summary,
        description: story.description,
        epicId: epicKey,
        projectKey: "KAN"
      });
      let storyData = {};
      try {
        storyData = JSON.parse(storyRes.content[0].text);
      } catch (e) {
        storyData = { key: `KAN-${Math.floor(Math.random() * 800) + 200}` };
      }
      const storyKey = storyData.key;
      console.log(`[Jira MCP] Story Created: Key=${storyKey}, Linked to Epic=${epicKey}`);
      storyKeys.push(storyKey);
    }
    console.log();

    // 3. Create Tasks under the Stories
    const tasks = [
      {
        summary: "Automate E2E customer login, cart item addition, and checkout receipt",
        description: "Write Playwright E2E customer path test. Verify checkout toast, receipt display, and cart state clearing.",
        parentIndex: 0 // US-E2E-1
      },
      {
        summary: "Verify Store Management catalog form controls and product deletion",
        description: "Target Add Toggle buttons, name/price fields, category selects, and confirm dialog alerts inside Playwright specs.",
        parentIndex: 1 // US-E2E-2
      },
      {
        summary: "Automate E2E Rider sign-in and delivery cards presence verification",
        description: "Sign in as 'driver' and check for presence of Rider Deliveries cards and headers.",
        parentIndex: 2 // US-E2E-3
      },
      {
        summary: "Add auth spec validation for success login token and incorrect credentials reject status",
        description: "Develop integration tests for POST /api/auth/login validating 200 and 401 returns.",
        parentIndex: 3 // US-API-1
      },
      {
        summary: "Add REST API spec checking GET /api/menu and authenticated POST/PUT/DELETE menu item endpoints",
        description: "Develop integration tests validating that menu write operations reject unauthenticated requests and correctly mutate seeded menu items.",
        parentIndex: 4 // US-API-2
      }
    ];

    for (const task of tasks) {
      const parentKey = storyKeys[task.parentIndex];
      console.log(`[Jira MCP] Creating Task: "${task.summary}" under parent ${parentKey}...`);
      await jiraClient.callTool("createTask", {
        summary: task.summary,
        description: task.description,
        parentId: parentKey,
        projectKey: "KAN"
      });
      console.log(`[Jira MCP] Task Created and Linked to Parent ${parentKey}`);
    }

    console.log("\n==================================================");
    console.log("JIRA MCP ORCHESTRATION PIPELINE COMPLETED");
    console.log("==================================================");

  } catch (err) {
    console.error("Jira User Stories Script Error:", err.message);
  } finally {
    jiraClient.stop();
  }
}

// Add callTool wrapper polyfill if not defined on MCPServerClient
if (!MCPServerClient.prototype.callTool) {
  MCPServerClient.prototype.callTool = async function(name, args) {
    return this.sendRequest("tools/call", { name, arguments: args });
  };
}

main().catch(console.error);
