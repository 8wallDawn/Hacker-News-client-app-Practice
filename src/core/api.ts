import {NewsFeed, NewsDetail} from '../types';
import {NEWS_URL, CONTENT_URL} from '../config';

function applyApiMixins(targetClass: any, baseClasses: any[]): void {
	baseClasses.forEach(baseClass => {
		Object.getOwnPropertyNames(baseClass.prototype).forEach(name => {
			const descriptor = Object.getOwnPropertyDescriptor(baseClass.prototype, name);

			if (descriptor) {
				Object.defineProperty(targetClass.prototype, name, descriptor);
			}
		});
	});
}
console.log(CONTENT_URL);
console.log(NEWS_URL);
export class Api {
	getRequest < AjaxResponse > (url: string): AjaxResponse {
		const ajax = new XMLHttpRequest();
		ajax.open('GET', url, false) // 데이터를 동기적으로 가져오겠다.
		ajax.send(); // 데이터를 가져온다.

		return JSON.parse(ajax.response);
	}
}

export class NewsFeedApi {
	getData(): NewsFeed[] {
		return this.getRequest < NewsFeed[] > (NEWS_URL);
	}
}

export class NewsDetailApi {
	getData(id: string): NewsDetail {
		return this.getRequest < NewsDetail > (CONTENT_URL.replace('@id', id));
	}
}

export interface NewsFeedApi extends Api {};
export interface NewsDetailApi extends Api {};
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);