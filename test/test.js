var request = require('supertest');
request = request('https://localhost:9001');

request.get('/dashboard').expect(200);
request.get('/dashboard/canvas-designer.html?open=true&sessionid=1&publicRoomIdentifier=dashboard&userFullName=zombie').expect(200);