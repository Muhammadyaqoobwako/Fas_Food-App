const fs = require('fs');
const path = require('path');

// Helper to load .env from the backend directory
function loadEnv() {
  try {
    const envPath = path.resolve(__dirname, '../../Fas_Food-Backend/.env');
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
        if (match) {
          const key = match[1].trim();
          let value = (match[2] || '').trim();
          if (value.startsWith('"') && value.endsWith('"')) {
            value = value.substring(1, value.length - 1);
          }
          // Remove carriage return if on Windows
          value = value.replace(/\r$/, '').trim();
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (e) {
    console.error('JiraReporter: Failed to load .env file:', e.message);
  }
}

loadEnv();

const JIRA_HOST = (process.env.JIRA_HOST || 'https://muhammadyaqoobwako.atlassian.net/').trim();
const JIRA_EMAIL = (process.env.JIRA_EMAIL || 'muhammadyaqoobwako@gmail.com').trim();
const JIRA_API_TOKEN = (process.env.JIRA_API_TOKEN || '').trim();
const JIRA_PROJECT_KEY = (process.env.JIRA_PROJECT_KEY || 'KAN').trim();

class JiraReporter {
  constructor(options) {
    this.options = options || {};
    this.promises = [];
  }

  onTestEnd(test, result) {
    if (result.status !== 'failed' && result.status !== 'timedOut') {
      return;
    }
    // Track the async promise to ensure Playwright awaits it onEnd
    const promise = this.reportFailure(test, result);
    this.promises.push(promise);
  }

  async onEnd(result) {
    if (this.promises.length > 0) {
      console.log(`\n[JiraReporter] Waiting for all pending Jira ticket operations to complete (${this.promises.length} tickets)...`);
      await Promise.all(this.promises);
      console.log('[JiraReporter] All pending Jira operations completed.');
    }
  }

  async reportFailure(test, result) {
    const testTitle = test.title;
    console.log(`[JiraReporter] Processing Jira ticket for: "${testTitle}"`);

    if (!JIRA_API_TOKEN || JIRA_API_TOKEN.startsWith('mock') || !JIRA_HOST || !JIRA_EMAIL) {
      console.log(`[JiraReporter] Jira credentials missing/mocked. JIRA_HOST: "${JIRA_HOST}", JIRA_EMAIL: "${JIRA_EMAIL}", token length: ${JIRA_API_TOKEN ? JIRA_API_TOKEN.length : 0}. Skipping.`);
      return;
    }

    try {
      // 1. Duplicate Prevention check
      const query = `project = "${JIRA_PROJECT_KEY}" AND statusCategory != Done AND summary ~ "[AUTO][PLAYWRIGHT] Failed Scenario - ${testTitle.replace(/"/g, '\\"')}"`;
      const searchUrl = `${JIRA_HOST.replace(/\/$/, '')}/rest/api/3/search/jql?jql=${encodeURIComponent(query)}`;
      const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_API_TOKEN}`).toString('base64');

      console.log(`[JiraReporter] Checking if duplicate issue exists in project ${JIRA_PROJECT_KEY}...`);
      const searchRes = await fetch(searchUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json'
        }
      });

      if (!searchRes.ok) {
        const errText = await searchRes.text();
        throw new Error(`Jira Search API failed (${searchRes.status}): ${errText}`);
      }

      const searchData = await searchRes.json();
      const expectedSummary = `[AUTO][PLAYWRIGHT] Failed Scenario - ${testTitle}`;
      const duplicate = searchData.issues && searchData.issues.find(issue => {
        return issue.fields && issue.fields.summary === expectedSummary;
      });
      if (duplicate) {
        console.log(`[JiraReporter] Duplicate open ticket found: Key ${duplicate.key}. Skipping Bug creation.`);
        return;
      }

      // 2. Identify the original story/task key to link
      let originalStoryKey = null;
      const jiraLinkAnnotation = test.annotations.find(a => a.type === 'jira_link');
      if (jiraLinkAnnotation) {
        originalStoryKey = jiraLinkAnnotation.description;
      }
      if (!originalStoryKey) {
        const match = testTitle.match(/\[([A-Z]+-\d+)\]/) || testTitle.match(/^([A-Z]+-\d+)/);
        if (match) {
          originalStoryKey = match[1];
        }
      }

      // 3. Extract errors, logs, stack trace and screenshot
      const errorMsg = result.errors.map(e => e.message || '').join('\n');
      const stackTrace = result.errors.map(e => e.stack || '').join('\n') || 'No stack trace available';
      
      const screenshotAttachment = result.attachments.find(a => a.contentType === 'image/png' || a.name === 'screenshot');
      const screenshotPath = (screenshotAttachment && screenshotAttachment.path) ? screenshotAttachment.path : 'None';

      // 4. Construct ticket description in Atlassian Document Format (ADF)
      const description = {
        type: "doc",
        version: 1,
        content: [
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Scenario Name: ", marks: [{ type: "strong" }] },
              { type: "text", text: testTitle }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Expected Result: ", marks: [{ type: "strong" }] },
              { type: "text", text: "Test passes successfully without assertion errors." }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Actual Result: ", marks: [{ type: "strong" }] },
              { type: "text", text: errorMsg || 'Test failed without explicit assertion message.' }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Screenshot Path: ", marks: [{ type: "strong" }] },
              { type: "text", text: screenshotPath }
            ]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Environment: ", marks: [{ type: "strong" }] },
              { type: "text", text: process.env.NODE_ENV || 'local' }
            ]
          },
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "Error Logs & Stack Trace" }]
          },
          {
            type: "codeBlock",
            attrs: { language: "text" },
            content: [{ type: "text", text: stackTrace }]
          },
          {
            type: "heading",
            attrs: { level: 4 },
            content: [{ type: "text", text: "Reproduction Steps" }]
          },
          {
            type: "paragraph",
            content: [
              { type: "text", text: "Run this test command locally: " },
              { type: "text", text: `npx playwright test -g "${testTitle.replace(/"/g, '\\"')}"`, marks: [{ type: "code" }] }
            ]
          }
        ]
      };

      if (originalStoryKey) {
        description.content.push({
          type: "paragraph",
          content: [
            { type: "text", text: "Linked to original story/task: ", marks: [{ type: "strong" }] },
            { type: "text", text: originalStoryKey }
          ]
        });
      }

      // 5. Create Bug Ticket in Jira
      console.log(`[JiraReporter] Creating Bug ticket for: "${testTitle}"`);
      const createUrl = `${JIRA_HOST.replace(/\/$/, '')}/rest/api/3/issue`;
      const createRes = await fetch(createUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            project: { key: JIRA_PROJECT_KEY },
            summary: `[AUTO][PLAYWRIGHT] Failed Scenario - ${testTitle}`,
            description,
            issuetype: { name: "Bug" }
          }
        })
      });

      if (!createRes.ok) {
        const errText = await createRes.text();
        throw new Error(`Jira Create Issue failed (${createRes.status}): ${errText}`);
      }

      const issueData = await createRes.json();
      const issueKey = issueData.key;
      console.log(`[JiraReporter] Successfully created Jira Bug ticket: ${issueKey}`);

      // 6. Link to Original Story (if applicable)
      if (originalStoryKey) {
        console.log(`[JiraReporter] Linking Bug ${issueKey} to original story/task ${originalStoryKey}...`);
        const linkUrl = `${JIRA_HOST.replace(/\/$/, '')}/rest/api/3/issueLink`;
        const linkRes = await fetch(linkUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            type: { name: "Relates" },
            inwardIssue: { key: issueKey },
            outwardIssue: { key: originalStoryKey }
          })
        });

        if (!linkRes.ok) {
          const errText = await linkRes.text();
          console.error(`[JiraReporter] Warning: Failed to link issue ${issueKey} to ${originalStoryKey}:`, errText);
        } else {
          console.log(`[JiraReporter] Successfully linked issue ${issueKey} to ${originalStoryKey}.`);
        }
      }

      // 7. Upload Screenshot Attachment (if available)
      if (screenshotAttachment && screenshotAttachment.path && fs.existsSync(screenshotAttachment.path)) {
        console.log(`[JiraReporter] Uploading screenshot to issue ${issueKey}...`);
        
        const attachUrl = `${JIRA_HOST.replace(/\/$/, '')}/rest/api/3/issue/${issueKey}/attachments`;
        
        const formData = new FormData();
        const fileBuffer = fs.readFileSync(screenshotAttachment.path);
        const blob = new Blob([fileBuffer], { type: 'image/png' });
        formData.append('file', blob, path.basename(screenshotAttachment.path));

        const attachRes = await fetch(attachUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'X-Atlassian-Token': 'no-check'
          },
          body: formData
        });

        if (!attachRes.ok) {
          const errText = await attachRes.text();
          console.error(`[JiraReporter] Warning: Failed to upload screenshot to issue ${issueKey}:`, errText);
        } else {
          console.log(`[JiraReporter] Screenshot successfully attached to ${issueKey}.`);
        }
      } else {
        console.log('[JiraReporter] No screenshot attachment found or screenshot file does not exist.');
      }

    } catch (err) {
      console.error(`[JiraReporter] Error during ticket reporting for "${testTitle}":`, err.message);
    }
  }
}

module.exports = JiraReporter;
