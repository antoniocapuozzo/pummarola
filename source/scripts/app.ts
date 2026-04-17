const bootTimestamp = new Intl.DateTimeFormat('en', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(new Date());

console.info(`[Pummarola] App loaded at ${bootTimestamp}`);
