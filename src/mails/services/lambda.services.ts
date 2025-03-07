exports.handler = async (event) => {
  // Get the Payload
  const payload = JSON.parse(event.body);

  // Configure Send In Blue
  // eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
  var SibApiV3Sdk = require('sib-api-v3-sdk');
  const defaultClient = SibApiV3Sdk.ApiClient.instance;

  // Configure API key authorization: api-key
  const apiKey = defaultClient.authentications['api-key'];
  apiKey.apiKey = process.env.SENDINBLUE_API_KEY;

  console.log('Configuration Completed!');
  try {
    const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail(); // SendSmtpEmail | Values to send a transactional email

    sendSmtpEmail = {
      to: [
        {
          email: payload['recipient_email'],
          name: `${payload['recipient_first_name']} ${payload['recipient_last_name']}`,
        },
      ],
      templateId: payload['template_id'],
      params: {
        FIRSTNAME: payload['recipient_first_name'] || '',
        LASTNAME: payload['recipient_last_name'] || '',
        SMS: payload['callback_url'] || '',
        CODEWORD: payload['code_word'] || '',
        DATE: payload['date'] || '',
        DURATION: payload['duration'] || '',
      },
      headers: {
        'X-Mailin-custom':
          'custom_header_1:custom_value_1|custom_header_2:custom_value_2',
      },
    };

    console.log('sendSmtpEmail => ', sendSmtpEmail);

    await apiInstance.sendTransacEmail(sendSmtpEmail);

    const response = {
      statusCode: 200,
      body: 'Email Sent',
    };
    return response;
  } catch (error) {
    console.log('error', error);
    console.log('error stack trace', error.stack);
  }
};
