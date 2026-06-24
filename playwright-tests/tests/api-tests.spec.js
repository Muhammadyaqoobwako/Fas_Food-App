const { test, expect } = require('@playwright/test');

test.describe('Modernized Fast-Food System Integration API Tests [KAN-3]', () => {

  test('TC-SEC-01: Successful Cashier Login', async ({ request }) => {
    const response = await request.post('http://127.0.0.1:5000/api/auth/login', {
      data: {
        username: 'dorry',
        password: 'dorry'
      }
    });
    expect(response.ok()).toBe(true);
    const body = await response.json();
    expect(body.success).toBe(true);
    expect(body.token).toBeDefined();
    expect(body.cashier.username).toBe('dorry');
  });

  test('TC-SEC-02: Failed Login (Invalid Credentials)', async ({ request }) => {
    const response = await request.post('http://127.0.0.1:5000/api/auth/login', {
      data: {
        username: 'dorry',
        password: 'wrongpassword'
      }
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.success).toBe(false);
    expect(body.message).toContain('INVALID PASSWORD OR USERNAME, PLEASE TRY AGAIN!!!');
  });

  test('TC-CALC-01: Correct Chips Price Multiplication & TC-DB-01: Category Routing', async ({ request }) => {
    // 1. Log in to get token
    const loginRes = await request.post('http://127.0.0.1:5000/api/auth/login', {
      data: { username: 'dorry', password: 'dorry' }
    });
    const loginBody = await loginRes.json();
    const token = loginBody.token;

    // 2. Submit order for Chips with quantity 3 and unit price 4.5
    const orderResponse = await request.post('http://127.0.0.1:5000/api/orders', {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        category: 'Chips',
        items: [
          {
            description: 'Large Salted Chips',
            quantity: 3,
            unitPrice: 4.5,
            servedWith: 'Tomato Sauce'
          }
        ]
      }
    });
    expect(orderResponse.ok()).toBe(true);
    const orderBody = await orderResponse.json();
    expect(orderBody.success).toBe(true);
    // Total Amount should be calculated as 3 * 4.5 = 13.5
    expect(orderBody.data.totalAmount).toBe(13.5);
    expect(orderBody.data.category).toBe('Chips');
  });

  test('TC-REP-01: Cashier Sales Summary Retrieval', async ({ request }) => {
    // 1. Log in to get token
    const loginRes = await request.post('http://127.0.0.1:5000/api/auth/login', {
      data: { username: 'dorry', password: 'dorry' }
    });
    const loginBody = await loginRes.json();
    const token = loginBody.token;

    // 2. Fetch sales report
    const reportRes = await request.get('http://127.0.0.1:5000/api/orders/reports/sales', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    expect(reportRes.ok()).toBe(true);
    const reportBody = await reportRes.json();
    expect(reportBody.success).toBe(true);
    expect(reportBody.data.totalRevenue).toBeDefined();
    expect(reportBody.data.totalOrders).toBeDefined();
  });
});
