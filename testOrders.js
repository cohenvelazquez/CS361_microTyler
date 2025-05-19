// testOrders.js
import axios from 'axios';

const baseURL = 'http://localhost:3000';

async function runTests() {
  try {
    // 1) Create a new order
    console.log('\n Creating order…');
    const createRes = await axios.post(
      `${baseURL}/orders`,
      {
        userId: 'test-user-123',
        items: [
          { productId: 'apple', quantity: 3, price: 0.5 },
          { productId: 'banana', quantity: 2, price: 0.35 }
        ]
      },
      { headers: { 'Content-Type': 'application/json' } }
    );
    console.log('Created:', createRes.data);
    const { orderId } = createRes.data;

    // 2) Fetch that order
    console.log('\n Fetching order…');
    const getRes = await axios.get(`${baseURL}/orders/${orderId}`);
    console.log('Fetched:', getRes.data);

    // 3) Update its status to “complete”
    console.log('\n Marking order complete…');
    const completeRes = await axios.put(
      `${baseURL}/orders/${orderId}`,
      { status: 'complete' }
    );
    console.log('Updated status:', completeRes.data);

    // 4) Update the items array
    console.log('\n Changing items…');
    const itemsRes = await axios.put(
      `${baseURL}/orders/${orderId}`,
      {
        items: [
          { productId: 'apple', quantity: 1, price: 0.5 },
          { productId: 'cherry', quantity: 5, price: 0.2 }
        ]
      }
    );
    console.log('Updated items:', itemsRes.data);

    // 5) Final sanity-check fetch
    console.log('\n Final fetch…');
    const finalRes = await axios.get(`${baseURL}/orders/${orderId}`);
    console.log('Final:', finalRes.data);

    console.log('\n All tests completed!');
  } catch (err) {
    if (err.response) {
      console.error('\n Error response:', err.response.status, err.response.data);
    } else {
      console.error('\n Error: Service is not running', err.message);
    }
    process.exit(1);
  }
}

runTests();