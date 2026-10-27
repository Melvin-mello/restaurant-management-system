async function testAPI() {
    try {
        console.log('🔍 1. Checking if Menu route exists...');
        const getRes = await fetch('http://localhost:5000/api/menu');
        const getData = await getRes.json();
        console.log('GET Response:', JSON.stringify(getData, null, 2));

        console.log('\n➕ 2. Adding the Classic Burger...');
        const postRes = await fetch('http://localhost:5000/api/menu', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name: "Classic Burger",
                description: "Juicy beef patty with cheese",
                price: 12.99,
                category: "Mains",
                is_available: true
            })
        });
        const postData = await postRes.json();
        console.log('POST Response:', JSON.stringify(postData, null, 2));

        console.log('\n✅ 3. Verifying the burger was saved...');
        const finalRes = await fetch('http://localhost:5000/api/menu');
        const finalData = await finalRes.json();
        console.log('Final GET Response:', JSON.stringify(finalData, null, 2));

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}
testAPI();
