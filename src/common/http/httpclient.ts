/**
 * http ajax请求
 * 目前只是一个简单实现
 */

export type HttpMethod = 'post' | 'get';

export type HttpData = Document | BodyInit | null;

export interface HttpOptions {
	[key: string]: any;
}

export interface httpResult {
	success: boolean;
	status: number;
	message: string;
	response: any;
}

export class HttpClient {
	static get(url: string, options?: HttpOptions): Promise<httpResult> {
		return HttpClient.exec(url, 'get', null, options);
	}

	static post(url: string, data: HttpData, options?: HttpOptions): Promise<httpResult> {
		return HttpClient.exec(url, 'post', data, options);
	}

	static exec(
		url: string,
		method: HttpMethod,
		data: HttpData | null,
		options?: HttpOptions
	): Promise<httpResult> {
		return new Promise<httpResult>(function(resolve, reject) {
      const xhr = new XMLHttpRequest();
      const { timeout = 3000, responseType = 'text' } = options || {};
      //设置xhr请求的超时时间
      xhr.timeout = timeout;
      //设置响应返回的数据格式
      xhr.responseType = responseType;
			xhr.open(method, url);
			xhr.onload = function() {
				if (xhr.status === 200) {
					resolve({
						success: true,
						status: 200,
						message: 'ok',
						response: xhr.responseText,
					});
				} else {
					reject({
						success: false,
						status: xhr.status,
						message: 'error',
						response: xhr.responseText,
					});
				}
			};
			xhr.onerror = function() {
				reject({
					success: false,
					status: xhr.status,
					message: 'error'
				});
			};
			xhr.ontimeout = function() {
				reject({
					success: false,
					status: xhr.status,
					message: 'timeout'
				});
			};
      xhr.send(data);
		});
	}
}
