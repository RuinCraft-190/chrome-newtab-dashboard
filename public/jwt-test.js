function generateJWT() {
  chrome.runtime.sendMessage({ action: 'GET_WEATHER' }, (response) => {
    const resultDiv = document.getElementById('result');

    if (chrome.runtime.lastError) {
      resultDiv.className = 'result error';
      resultDiv.textContent = '错误: ' + chrome.runtime.lastError.message;
      return;
    }

    if (!response || !response.success) {
      resultDiv.className = 'result error';
      resultDiv.textContent = '错误: ' + (response?.error || '未知错误');
      return;
    }

    const token = response.token;
    const jwtToken = token.replace('Bearer ', '');

    // 解析 JWT
    const parts = jwtToken.split('.');
    const header = JSON.parse(atob(parts[0]));
    const payload = JSON.parse(atob(parts[1]));

    resultDiv.className = 'result';
    resultDiv.innerHTML = '<strong>JWT Header:</strong>\n' +
      JSON.stringify(header, null, 2) + '\n\n<strong>JWT Payload:</strong>\n' +
      JSON.stringify(payload, null, 2) + '\n\n<strong>完整 JWT Token (复制到控制台验证):</strong>\n' +
      jwtToken;
  });
}

function testAPI() {
  chrome.runtime.sendMessage({ action: 'GET_WEATHER' }, (response) => {
    if (!response || !response.success) {
      const resultDiv = document.getElementById('result');
      resultDiv.className = 'result error';
      resultDiv.textContent = '获取 Token 失败';
      return;
    }

    fetch('https://kt487t53tq.re.qweatherapi.com/v7/weather/now?location=101010100', {
      headers: { Authorization: response.token }
    })
    .then(res => res.json())
    .then(data => {
      const resultDiv = document.getElementById('result');
      if (data.code === '200') {
        resultDiv.className = 'result success';
        resultDiv.textContent = '成功!\n\n' + JSON.stringify(data, null, 2);
      } else {
        resultDiv.className = 'result error';
        resultDiv.textContent = '失败: ' + JSON.stringify(data, null, 2);
      }
    })
    .catch(error => {
      const resultDiv = document.getElementById('result');
      resultDiv.className = 'result error';
      resultDiv.textContent = '错误: ' + error.message;
    });
  });
}

document.getElementById('genBtn').addEventListener('click', generateJWT);
document.getElementById('testBtn').addEventListener('click', testAPI);
