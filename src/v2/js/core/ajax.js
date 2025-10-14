/**
 * AJAX Utilities - Fetch API wrappers to replace jQuery.ajax
 * Provides helper functions for common HTTP requests
 */

/**
 * Default fetch options
 */
const defaultOptions = {
  credentials: 'same-origin',
  headers: {
    'Content-Type': 'application/json'
  }
};

/**
 * Parse response based on content type
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>}
 */
async function parseResponse(response) {
  const contentType = response.headers.get('content-type');

  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }

  if (contentType && contentType.includes('text/')) {
    return response.text();
  }

  return response.blob();
}

/**
 * Handle fetch response
 * @param {Response} response - Fetch response object
 * @returns {Promise<any>}
 * @throws {Error} If response is not ok
 */
async function handleResponse(response) {
  if (!response.ok) {
    const error = new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.statusText = response.statusText;

    try {
      error.data = await parseResponse(response);
    } catch (e) {
      error.data = null;
    }

    throw error;
  }

  return parseResponse(response);
}

/**
 * Perform GET request
 * @param {string} url - Request URL
 * @param {Object} options - Optional fetch options
 * @returns {Promise<any>}
 */
export async function get(url, options = {}) {
  const config = {
    ...defaultOptions,
    ...options,
    method: 'GET'
  };

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error('GET request failed:', error);
    throw error;
  }
}

/**
 * Perform POST request
 * @param {string} url - Request URL
 * @param {*} data - Data to send in request body
 * @param {Object} options - Optional fetch options
 * @returns {Promise<any>}
 */
export async function post(url, data = null, options = {}) {
  const config = {
    ...defaultOptions,
    ...options,
    method: 'POST'
  };

  // Serialize data if it's an object and content-type is JSON
  if (data !== null) {
    const contentType = config.headers['Content-Type'] || config.headers['content-type'];

    if (contentType && contentType.includes('application/json')) {
      config.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      config.body = data;
      // Remove Content-Type header to let browser set it with boundary
      delete config.headers['Content-Type'];
      delete config.headers['content-type'];
    } else {
      config.body = data;
    }
  }

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error('POST request failed:', error);
    throw error;
  }
}

/**
 * Perform PUT request
 * @param {string} url - Request URL
 * @param {*} data - Data to send in request body
 * @param {Object} options - Optional fetch options
 * @returns {Promise<any>}
 */
export async function put(url, data = null, options = {}) {
  const config = {
    ...defaultOptions,
    ...options,
    method: 'PUT'
  };

  if (data !== null) {
    const contentType = config.headers['Content-Type'] || config.headers['content-type'];

    if (contentType && contentType.includes('application/json')) {
      config.body = JSON.stringify(data);
    } else {
      config.body = data;
    }
  }

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error('PUT request failed:', error);
    throw error;
  }
}

/**
 * Perform DELETE request
 * @param {string} url - Request URL
 * @param {Object} options - Optional fetch options
 * @returns {Promise<any>}
 */
export async function del(url, options = {}) {
  const config = {
    ...defaultOptions,
    ...options,
    method: 'DELETE'
  };

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error('DELETE request failed:', error);
    throw error;
  }
}

/**
 * Upload file(s)
 * @param {string} url - Upload URL
 * @param {File|File[]} files - File or array of files to upload
 * @param {Object} additionalData - Additional form data
 * @param {Object} options - Optional fetch options
 * @returns {Promise<any>}
 */
export async function upload(url, files, additionalData = {}, options = {}) {
  const formData = new FormData();

  // Add files
  if (Array.isArray(files)) {
    files.forEach((file, index) => {
      formData.append(`file${index}`, file);
    });
  } else {
    formData.append('file', files);
  }

  // Add additional data
  Object.keys(additionalData).forEach(key => {
    formData.append(key, additionalData[key]);
  });

  return post(url, formData, options);
}

/**
 * Generic request function
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options including method, headers, body, etc.
 * @returns {Promise<any>}
 */
export async function request(url, options = {}) {
  const config = {
    ...defaultOptions,
    ...options
  };

  try {
    const response = await fetch(url, config);
    return handleResponse(response);
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
