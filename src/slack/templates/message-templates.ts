export const messageTemplates = {
  default: {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '${environment} Environment',
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Message from Server*\n${message}',
        },
      },
    ],
  },


};
