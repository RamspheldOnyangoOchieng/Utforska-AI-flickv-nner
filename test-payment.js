const fetch = require('node-fetch');

async function testPayment() {
    const response = await fetch('http://localhost:3000/api/verify-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            sessionId: 'cs_test_123',
        }),
    });

    const data = await response.json();
    console.log(data);
}

testPayment();