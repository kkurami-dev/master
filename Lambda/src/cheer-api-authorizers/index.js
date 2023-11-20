exports.handler = function (event, context, callback) {
  var authorizationHeader = event.headers.authorization;

  if (!authorizationHeader) return callback('Unauthorized');

  var encodedCreds = authorizationHeader.split(" ")[1];
  var plainCreds = (new Buffer(encodedCreds, 'base64')).toString().split(':');
  var username = plainCreds[0];
  var password = plainCreds[1];

  if (!(username === 'admin' && password === 'password')) return callback('Unauthorized');

  var authResponse = buildAllowAllPolicy(event, username);

  callback(null, authResponse);
};

function buildAllowAllPolicy (event, principalId) {
  const policy = {
    principalId: principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn
        }
      ]
    }
  };
  return policy;
}