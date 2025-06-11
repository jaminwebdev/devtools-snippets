(function() {
  const words = ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'in', 'culpa', 'qui', 'officia', 'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'];
  
  function generateLorem(wordCount = 50) {
    const result = [];
    for (let i = 0; i < wordCount; i++) {
      result.push(words[Math.floor(Math.random() * words.length)]);
    }
    return result.join(' ').replace(/^./, str => str.toUpperCase()) + '.';
  }
  
  const lorem = generateLorem(100);
  navigator.clipboard.writeText(lorem);
  console.log('Lorem ipsum generated and copied to clipboard:');
  console.log(lorem);
})();