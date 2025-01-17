// Original: https://gist.github.com/jeroenvollenbrock/94edbbc62adc986d6d6a9a3076e66f5b
// Currently work in progress

let USERNAME = 'test';
let PASSWORD = 'test';

let response401 = {
	statusCode: 401,
	statusDescription: 'Unauthorized',
	headers: {
		'www-authenticate': { value: 'Basic' },
	},
};

function validateBasicAuth(authHeader) {
	let match = authHeader.match(/^Basic (.+)$/);
	if (!match) {
		return false;
	}

	let credentials = String.bytesFrom(match[1], 'base64').split(':', 2);

	return credentials[0] === USERNAME && credentials[1] === PASSWORD;
}

function handler(event) {
	let request = event.request;
	let headers = request.headers;
	let auth = (headers.authorization && headers.authorization.value) || '';

	if (!validateBasicAuth(auth)) { return response401; }

	return request;
}
