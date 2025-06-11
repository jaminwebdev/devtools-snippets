(function() {
  const testData = {
    email: 'test@example.com',
    name: 'John Doe',
    firstname: 'John',
    lastname: 'Doe',
    phone: '555-0123',
    address: '123 Main St',
    city: 'New York',
    zip: '10001',
    company: 'Test Company'
  };
  
  document.querySelectorAll('input, select, textarea').forEach(input => {
    if (input.type === 'email') input.value = testData.email;
    else if (input.type === 'tel') input.value = testData.phone;
    else if (input.name && testData[input.name.toLowerCase()]) {
      input.value = testData[input.name.toLowerCase()];
    }
    else if (input.placeholder) {
      const placeholder = input.placeholder.toLowerCase();
      if (placeholder.includes('email')) input.value = testData.email;
      else if (placeholder.includes('name')) input.value = testData.name;
      else if (placeholder.includes('phone')) input.value = testData.phone;
    }
  });
  
  console.log('Forms auto-filled with test data');
})();