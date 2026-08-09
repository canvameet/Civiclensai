const baseUrl = 'http://localhost:5000';

async function testApi() {
  const results = [];
  let hasFailed = false;

  async function testEndpoint(method, url, body = null) {
    try {
      const options = { method, headers: {} };
      if (body) {
        options.headers['Content-Type'] = 'application/json';
        options.body = JSON.stringify(body);
      }
      const res = await fetch(`${baseUrl}${url}`, options);
      const text = await res.text();
      let data;
      try { data = JSON.parse(text); } catch(e) { data = text; }

      if (res.ok) {
        console.log(`[${method}] ${url} - Status: ${res.status} - PASS`);
        results.push({ url, method, pass: true, data });
        return data;
      } else {
        console.error(`[${method}] ${url} - Status: ${res.status} - FAIL`, data);
        results.push({ url, method, pass: false, error: data });
        hasFailed = true;
        return null;
      }
    } catch (err) {
      console.error(`[${method}] ${url} - Exception: ${err.message} - FAIL`);
      results.push({ url, method, pass: false, error: err.message });
      hasFailed = true;
      return null;
    }
  }

  console.log("Starting full API tests...");

  // 1. Health
  await testEndpoint('GET', '/api/health');

  // 2. GET Complaints
  await testEndpoint('GET', '/api/complaints');

  // 3. POST Complaint
  const newComplaintRes = await testEndpoint('POST', '/api/complaints', {
    rawText: "There is a massive water leak near the central crossroad.",
    area: "Satellite"
  });

  // 4. PATCH Complaint Status
  if (newComplaintRes && newComplaintRes.complaint) {
    const cid = newComplaintRes.complaint._id;
    await testEndpoint('PATCH', `/api/complaints/${cid}/status`, { status: "Verified" });
  }

  // 5. POST Scrape
  await testEndpoint('POST', '/api/social/scrape');

  // 6. GET Social Feed
  const feedRes = await testEndpoint('GET', '/api/social/feed');

  // 7. POST Convert Social Post
  if (feedRes && feedRes.posts && feedRes.posts.length > 0) {
    // Find one that is not already converted, or just try the first one
    const postToConvert = feedRes.posts.find(p => !p.convertedToComplaint);
    if (postToConvert) {
      await testEndpoint('POST', `/api/social/${postToConvert.postId}/convert`);
    } else {
      console.log("No unconverted posts available to test /convert.");
    }
  }

  // 8. GET Analytics
  await testEndpoint('GET', '/api/analytics');

  // 9. GET Analytics Area
  await testEndpoint('GET', '/api/analytics/area');

  if (hasFailed) {
    console.error("\\nSome tests failed.");
    process.exit(1);
  } else {
    console.log("\\nAll tests passed successfully.");
    process.exit(0);
  }
}

testApi();
