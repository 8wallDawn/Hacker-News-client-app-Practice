import View from '../core/view';
import { NewsDetailApi } from '../core/api';
import { NewsDetail, NewsComment } from '../types';

const template = `
<div class="bg-gray-600 min-h-screen pb-8">
  <div class="bg-white text-xl">
    <div class="mx-auto px-4">
      <div class="flex justify-between items-center py-6">
        <div class="flex justify-start">
          <h1 class="font-extrabold">Hacker News</h1>
        </div>
        <div class="items-center justify-end">
          <a href="#/page/{{__currentPage__}}" class="text-gray-500">
            <i class="fa fa-times"></i>
          </a>
        </div>
      </div>
    </div>
  </div>

  <div class="h-full border rounded-xl bg-white m-6 p-4 ">
    <h2>{{__title__}}</h2>
    <div class="text-gray-400 h-20">
      {{__content__}}
    </div>

    {{__comments__}}

  </div>
</div>
`;

export default class NewsDetailView extends View {
	constructor(containerId: string) {

	  super(containerId, template);
	}

	render() {
		// console.log('해시가 변경되었습니다.')
		// console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
		const id = location.hash.substr(7) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장
		const api = new NewsDetailApi();
		const newsDetail: NewsDetail = api.getData(id);

		for (let i = 0; i < window.store.feeds.length; ++i) {
			if (window.store.feeds[i].id === +id) {
				window.store.feeds[i].read = true;
				break;
			}
		}

		this.setTemplateData('comments', this.makeComment(newsDetail.comments));
		this.setTemplateData('currentPage', String(window.store.currentPage));
		this.setTemplateData('title', newsDetail.title)
		this.setTemplateData('content', newsDetail.content);

		this.updateView();
	}

	makeComment(comments: NewsComment[]): string {
		for (let i = 0; i < comments.length; ++i) {
			const comment: NewsComment = comments[i];
	
			this.addHtml(`
				<div style="padding-left: ${comment.level * 40}px;" class="mt-4">
					<div class="text-gray-400">
						<i class="fa fa-sort-up mr-2"></i>
						<strong>${comment.user}</strong> ${comment.time_ago}
					</div>
					<p class="text-gray-700">${comment.content}</p>
				</div>      
			`);
	
			if (comment.comments.length > 0) {
				this.addHtml(this.makeComment(comment.comments));
			}
		}
	
		// console.log(commentString);
		return this.getHtml();
	}
}