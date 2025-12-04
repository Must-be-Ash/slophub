
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 4ms (compile: 1240µs, render: 2ms)
 POST /.well-known/workflow/v1/step 200 in 952ms (compile: 932µs, render: 951ms)
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 780µs, render: 1824µs)
Failed to log step scrape: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async logStepDataStep (app/.well-known/workflow/v1/step/route.js:552:5)
  550 |   const client = new MongoClient2(mongoUri);
  551 |   try {
> 552 |     await client.connect();
      |     ^
  553 |     const database = client.db("blog-agent");
  554 |     const collection = database.collection("workflow_step_logs");
  555 |     const logEntry = { {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 792µs, render: 2ms)
 POST /.well-known/workflow/v1/step 200 in 30.2s (compile: 678µs, render: 30.2s)
 POST /.well-known/workflow/v1/flow 200 in 22ms (compile: 875µs, render: 21ms)
 POST /.well-known/workflow/v1/step 200 in 10ms (compile: 697µs, render: 10ms)
 POST /.well-known/workflow/v1/flow 200 in 24ms (compile: 904µs, render: 23ms)
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 1018µs, render: 1861µs)
Failed to log step search: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async logStepDataStep (app/.well-known/workflow/v1/step/route.js:552:5)
  550 |   const client = new MongoClient2(mongoUri);
  551 |   try {
> 552 |     await client.connect();
      |     ^
  553 |     const database = client.db("blog-agent");
  554 |     const collection = database.collection("workflow_step_logs");
  555 |     const logEntry = { {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
 POST /.well-known/workflow/v1/step 200 in 30.1s (compile: 1224µs, render: 30.1s)
 POST /.well-known/workflow/v1/flow 200 in 34ms (compile: 1370µs, render: 33ms)
 POST /.well-known/workflow/v1/step 200 in 9ms (compile: 784µs, render: 8ms)
 POST /.well-known/workflow/v1/flow 200 in 29ms (compile: 599µs, render: 29ms)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 1488µs, render: 1933µs)
Failed to log step generate: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async logStepDataStep (app/.well-known/workflow/v1/step/route.js:552:5)
  550 |   const client = new MongoClient2(mongoUri);
  551 |   try {
> 552 |     await client.connect();
      |     ^
  553 |     const database = client.db("blog-agent");
  554 |     const collection = database.collection("workflow_step_logs");
  555 |     const logEntry = { {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
 POST /.well-known/workflow/v1/step 200 in 30.1s (compile: 649µs, render: 30.1s)
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 827µs, render: 2ms)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 4ms (compile: 1403µs, render: 2ms)
Failed to log step create: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async logStepDataStep (app/.well-known/workflow/v1/step/route.js:552:5)
  550 |   const client = new MongoClient2(mongoUri);
  551 |   try {
> 552 |     await client.connect();
      |     ^
  553 |     const database = client.db("blog-agent");
  554 |     const collection = database.collection("workflow_step_logs");
  555 |     const logEntry = { {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
 POST /.well-known/workflow/v1/step 200 in 30.1s (compile: 676µs, render: 30.1s)
 POST /.well-known/workflow/v1/flow 200 in 60ms (compile: 1478µs, render: 58ms)
 POST /.well-known/workflow/v1/step 200 in 11ms (compile: 820µs, render: 10ms)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6

)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 1019µs, render: 2ms)
MongoDB save error: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async saveToMongoDBStep (app/.well-known/workflow/v1/step/route.js:521:5)
  519 |   const client = new MongoClient(mongoUri);
  520 |   try {
> 521 |     await client.connect();
      |     ^
  522 |     const database = client.db("blog-agent");
  523 |     const collection = database.collection("workflows");
  524 |     const result = await collection.insertOne(workflowData); {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
[Workflows] "wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA" - Encountered `Error` while executing step "step//workflows/steps/save-to-mongodb-step.ts//saveToMongoDBStep" (attempt 1):
  > MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    > 
    >     at Topology.selectServer (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:327:38)
    >     at async Topology._connect (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:200:28)

  This step has failed but will be retried
 POST /.well-known/workflow/v1/step 503 in 30.1s (compile: 699µs, render: 30.1s)

3µs)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 825µs, render: 1765µs)
MongoDB save error: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async saveToMongoDBStep (app/.well-known/workflow/v1/step/route.js:521:5)
  519 |   const client = new MongoClient(mongoUri);
  520 |   try {
> 521 |     await client.connect();
      |     ^
  522 |     const database = client.db("blog-agent");
  523 |     const collection = database.collection("workflows");
  524 |     const result = await collection.insertOne(workflowData); {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
[Workflows] "wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA" - Encountered `Error` while executing step "step//workflows/steps/save-to-mongodb-step.ts//saveToMongoDBStep" (attempt 2):
  > MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    > 
    >     at Topology.selectServer (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:327:38)
    >     at async Topology._connect (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:200:28)

  This step has failed but will be retried
 POST /.well-known/workflow/v1/step 503 in 30.1s (compile: 2ms, render: 30.1s)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6

 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 968µs, render: 1792µs)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 3ms (compile: 788µs, render: 2ms)
MongoDB save error: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at async saveToMongoDBStep (app/.well-known/workflow/v1/step/route.js:521:5)
  519 |   const client = new MongoClient(mongoUri);
  520 |   try {
> 521 |     await client.connect();
      |     ^
  522 |     const database = client.db("blog-agent");
  523 |     const collection = database.collection("workflows");
  524 |     const result = await collection.insertOne(workflowData); {
  errorLabelSet: Set(0) {},
  reason: [TopologyDescription],
  code: undefined,
  [cause]: MongoNetworkError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
  
      at ignore-listed frames {
    errorLabelSet: Set(1) { 'ResetPool' },
    beforeHandshake: false,
    [cause]: [Error: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    ] {
      library: 'SSL routines',
      reason: 'tlsv1 alert internal error',
      code: 'ERR_SSL_TLSV1_ALERT_INTERNAL_ERROR'
    }
  }
}
[Workflows] "wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA" - Encountered `Error` while executing step "step//workflows/steps/save-to-mongodb-step.ts//saveToMongoDBStep" (attempt 3):
  > MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80
    > 
    >     at Topology.selectServer (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:327:38)
    >     at async Topology._connect (/Users/ashnouruzi/blog-agent/node_modules/.pnpm/mongodb@6.21.0/node_modules/mongodb/lib/sdam/topology.js:200:28)

  Max retries reached
  Bubbling error to parent workflow
 POST /.well-known/workflow/v1/step 200 in 30.1s (compile: 1640µs, render: 30.1s)
MongoDB save failed: Error [FatalError]: Step "step//workflows/steps/save-to-mongodb-step.ts//saveToMongoDBStep" failed after max retries: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at ignore-listed frames {
  fatal: true
}
 POST /.well-known/workflow/v1/flow 200 in 83ms (compile: 1109µs, render: 82ms)
 POST /.well-known/workflow/v1/step 200 in 10ms (compile: 764µs, render: 9ms)
MongoDB save failed: Error [FatalError]: Step "step//workflows/steps/save-to-mongodb-step.ts//saveToMongoDBStep" failed after max retries: MongoServerSelectionError: 00E2970102000000:error:0A000438:SSL routines:ssl3_read_bytes:tlsv1 alert internal error:ssl/record/rec_layer_s3.c:916:SSL alert number 80

    at ignore-listed frames {
  fatal: true
}
 POST /.well-known/workflow/v1/flow 200 in 63ms (compile: 1071µs, render: 62ms)
[Status API] Returning cached steps for runId: wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA count: 6
 GET /api/workflows/untitled-4/status?runId=wrun_01KBNJ4CNFM2F7CN4KPPNK3WWA&stream=true 200 in 4ms (compile: 889µs, render: 3ms)
