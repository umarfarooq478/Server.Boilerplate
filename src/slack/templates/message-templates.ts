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

  alert: {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🚨 System Alert - ${environment}',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Severity:*\n${severity}',
          },
          {
            type: 'mrkdwn',
            text: '*Time:*\n${timestamp}',
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '*Details:*\n${message}',
        },
      },
    ],
  },

  roomAlert: {
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: '🏠 Room Capacity Alert - ${environment}',
        },
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: '*Current Room Count:*\n${currentCount}',
          },
          {
            type: 'mrkdwn',
            text: '*Alert Level:*\n${alertLevel}',
          },
        ],
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: '${message}',
        },
      },
    ],
  },
};
