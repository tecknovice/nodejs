'use strict';

const loopback = require('loopback');
const promisify = require('util').promisify;
const fs = require('fs');
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const mkdirp = promisify(require('mkdirp'));

const DATASOURCE_NAME = 'mysqlDS';
const dataSourceConfig = require('./server/datasources.json');
const db = new loopback.DataSource(dataSourceConfig[DATASOURCE_NAME]);

discover().then(
    success => process.exit(),
    error => { console.error('UNHANDLED ERROR:\n', error); process.exit(1); },
);

async function discover() {
    // It's important to pass the same "options" object to all calls
    // of dataSource.discoverSchemas(), it allows the method to cache
    // discovered related models
    const options = {relations: true};
  
    // Discover models and relations
    
    const claims = await db.discoverSchemas('claims', options);
    const contract = await db.discoverSchemas('contract', options);
    const conversation_backups = await db.discoverSchemas('conversation_backups', options);
    const conversations = await db.discoverSchemas('conversations', options);
    const customers = await db.discoverSchemas('customers', options);
    const enquiries = await db.discoverSchemas('enquiries', options);
    const enquiry = await db.discoverSchemas('enquiry', options);
    const interactions = await db.discoverSchemas('interactions', options);
    const steps = await db.discoverSchemas('steps', options);
    const topic_map = await db.discoverSchemas('topic_map', options);
    const unknown_messages = await db.discoverSchemas('unknown_messages', options);
    
    // Create model definition files
    await mkdirp('common/models');
    await writeFile(
      'common/models/Claims.json',
      JSON.stringify(claims['bmlchatbot.claims'], null, 2)
    );
    await writeFile(
      'common/models/Contract.json',
      JSON.stringify(contract['bmlchatbot.contract'], null, 2)
    );
    await writeFile(
      'common/models/ConversationBackups.json',
      JSON.stringify(conversation_backups['bmlchatbot.conversation_backups'], null, 2)
    );
    await writeFile(
      'common/models/Conversations.json',
      JSON.stringify(conversations['bmlchatbot.conversations'], null, 2)
    );
    await writeFile(
      'common/models/Customers.json',
      JSON.stringify(customers['bmlchatbot.customers'], null, 2)
    );
    await writeFile(
      'common/models/Enquiries.json',
      JSON.stringify(enquiries['bmlchatbot.enquiries'], null, 2)
    );
    await writeFile(
      'common/models/Enquiry.json',
      JSON.stringify(enquiry['bmlchatbot.enquiry'], null, 2)
    );
    await writeFile(
      'common/models/Interactions.json',
      JSON.stringify(interactions['bmlchatbot.interactions'], null, 2)
    );
    await writeFile(
      'common/models/Steps.json',
      JSON.stringify(steps['bmlchatbot.steps'], null, 2)
    );
    await writeFile(
      'common/models/TopicMap.json',
      JSON.stringify(topic_map['bmlchatbot.topic_map'], null, 2)
    );
    await writeFile(
      'common/models/UnknownMessages.json',
      JSON.stringify(unknown_messages['bmlchatbot.unknown_messages'], null, 2)
    );
  
    // Expose models via REST API
    const configJson = await readFile('server/model-config.json', 'utf-8');
    const config = JSON.parse(configJson);

    config.Claims = {dataSource: DATASOURCE_NAME, public: true};
    config.Contract = {dataSource: DATASOURCE_NAME, public: true};
    config.ConversationBackups = {dataSource: DATASOURCE_NAME, public: true};
    config.Conversations = {dataSource: DATASOURCE_NAME, public: true};
    config.Customers = {dataSource: DATASOURCE_NAME, public: true};
    config.Enquiries = {dataSource: DATASOURCE_NAME, public: true};
    config.Enquiry = {dataSource: DATASOURCE_NAME, public: true};
    config.Interactions = {dataSource: DATASOURCE_NAME, public: true};
    config.Steps = {dataSource: DATASOURCE_NAME, public: true};
    config.TopicMap = {dataSource: DATASOURCE_NAME, public: true};
    config.UnknownMessages = {dataSource: DATASOURCE_NAME, public: true};

    await writeFile(
      'server/model-config.json',
      JSON.stringify(config, null, 2)
    );
}