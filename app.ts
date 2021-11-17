interface Store {
	currentPage: number;
	feeds: NewsFeed[];
}

interface News {
	readonly id: number;
	readonly time_ago: string;
	readonly title: string;
	readonly url: string;
	readonly user: string;
	readonly content: string;
}

interface NewsFeed extends News {
	readonly comments_count: number;
	readonly points: number;
	read ? : boolean;
}

interface NewsDetail extends News {
	readonly comments: NewsComment[];
}

interface NewsComment extends News {
	readonly comments: NewsComment[];
	level: number;
}

interface RouteInfo {
	path: string;
	page: View;
}

const container: HTMLElement | null = document.getElementById('root')
// const ajax : XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
	currentPage: 1,
	feeds: [],
}

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

class Api {
	getRequest < AjaxResponse > (url: string): AjaxResponse {
		const ajax = new XMLHttpRequest();
		ajax.open('GET', url, false) // 데이터를 동기적으로 가져오겠다.
		ajax.send(); // 데이터를 가져온다.

		return JSON.parse(ajax.response);
	}
}

class NewsFeedApi {
	getData(): NewsFeed[] {
		return this.getRequest < NewsFeed[] > (NEWS_URL);
	}
}

class NewsDetailApi {
	getData(id: string): NewsDetail {
		return this.getRequest < NewsDetail > (CONTENT_URL.replace('@id', id));
	}
}

interface NewsFeedApi extends Api {};
interface NewsDetailApi extends Api {};
applyApiMixins(NewsFeedApi, [Api]);
applyApiMixins(NewsDetailApi, [Api]);

abstract class View {
	private template : string;
	private renderTemplate: string;
	private container : HTMLElement;
	private htmlList :string[];

	constructor(containerId:string, template:string) {
		const containerElement = document.getElementById(containerId);

		if(!containerElement) {
			throw '최상위 컨테이너가 없어 UI를 진행하지 못합니다.';
		}

		this.container = containerElement;
		this.template = template;
		this.renderTemplate = template;
		this.htmlList = [];
	}

	protected updateView(): void {
		this.container.innerHTML = this.renderTemplate;
		this.renderTemplate = this.template;
	}

	protected  addHtml(htmlString:string): void {
		this.htmlList.push(htmlString);
	}

	protected getHtml(): string {
		const snapshot= this.htmlList.join('');
		this.clearHtmlList();
		return snapshot;
	}

	protected setTemplateData(key: string, value: string): void{
		this.renderTemplate = this.renderTemplate.replace(`{{__${key}__}}`, value)
	}

	private clearHtmlList(): void{
		this.htmlList = [];
	}

	abstract render():void; // 상속받는 class에 해당하는 자식 메소드를 구현하라는 의미의 마킹으로 '추상 메소드' 이다.
}

// 해쉬값에 따라 어떤 함수를 실행하여 사용자에게 제공할 것인지리를 판단하는 함수.
// 화면 전환의 주요 쟁점
class Router {
	routeTable: RouteInfo[];
	defaultRoute: RouteInfo | null;

	constructor() {
		// console.log(routePath); // #/page/(number)
		window.addEventListener('hashchange', this.route.bind(this));
	
		this.routeTable = [];
		this.defaultRoute = null;
	}

	setDefaultPage(page:View): void {
		this.defaultRoute = {path:'', page}
	}

	addRoutePath(path: string, page: View): void {
		this.routeTable.push({path, page});
	}

	route():void {
		const routePath = location.hash;

		if(routePath === '' && this.defaultRoute) {
			this.defaultRoute.page.render(); // abstract를 통한 render() 의 사용
		}

		for (const routeInfo of this.routeTable) {
			if ( routePath.indexOf(routeInfo.path) >= 0) {
				routeInfo.page.render(); // abstract를 통한 render() 의 사용
				break;
			}
		}
	}

}

class NewsFeedView extends View {
	private api: NewsFeedApi;
	private feeds: NewsFeed[];

	constructor(containerId:string) {
		let template = `
	<div class="bg-gray-600 min-h-screen">
	<div class="bg-white text-xl">
		<div class="mx-auto px-4">
			<div class="flex justify-between items-center py-6">
				<div class="flex justify-start">
					<h1 class="font-extrabold">Hacker News</h1>
				</div>
				<div class="items-center justify-end">
					<a href="#/page/{{__prev_page__}}" class="text-gray-500">
						Previous
					</a>
					<a href="#/page/{{__next_page__}}" class="text-gray-500 ml-4">
						Next
					</a>
				</div>
			</div> 
		</div>
	</div>
	<div class="p-4 text-2xl text-gray-700">
		{{__news_feed__}}        
	</div>
</div>
	`
		super(containerId, template);

		this.api = new NewsFeedApi();
		this.feeds = store.feeds;
		
		
		if (this.feeds.length === 0) {
			this.feeds = store.feeds = this.api.getData();
			this.makeFeeds();
		}
		// console.log(newsFeed)
		
		
	}
	
	render(): void {
		store.currentPage = Number(location.hash.substr(7) || 1);
		const maxPage = this.feeds.length % 10 === 0 ? this.feeds.length / 10 : this.feeds.length / 10 + 1;
		for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; ++i) {
			const {id, title, comments_count, user, points, time_ago, read} = this.feeds[i];
			this.addHtml(`
      <div class="p-6 ${read ? 'bg-red-200' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${id}">${title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${user}</div>
            <div><i class="fas fa-heart mr-1"></i>${points}</div>
            <div><i class="far fa-clock mr-1"></i>${time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
		};

		this.setTemplateData('news_feed', this.getHtml());
		this.setTemplateData('prev_page', String(store.currentPage > 1 ? store.currentPage - 1 : 1));
		this.setTemplateData('next_page', String(store.currentPage !== maxPage ? store.currentPage + 1 : maxPage));

		this.updateView();
	}

	private makeFeeds(): void {
		for (let i = 0; i < this.feeds.length; ++i) {
			this.feeds[i].read = false;
		}
	}
}

class NewsDetailView extends View {
	constructor(containerId: string) {
		let template = `
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

	super(containerId, template)
	}

	render() {
		// console.log('해시가 변경되었습니다.')
		// console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
		const id = location.hash.substr(7) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장
		const api = new NewsDetailApi();
		const newsDetail: NewsDetail = api.getData(id);

		for (let i = 0; i < store.feeds.length; ++i) {
			if (store.feeds[i].id === +id) {
				store.feeds[i].read = true;
				break;
			}
		}

		this.setTemplateData('comments', this.makeComment(newsDetail.comments));
		this.setTemplateData('currentPage', String(store.currentPage));
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

const router : Router = new Router();
const newsFeedView = new NewsFeedView('root');
const newsDetailView = new NewsDetailView('root');

// 페이지 구성과 구현
router.setDefaultPage(newsFeedView); //초기 페이지 설정으로 router에서 인자가 없을 때 구현할 초기 페이지

router.addRoutePath('/page/', newsFeedView); // hash 값에 page가 있을 때엔 newsFeedView를 출력할 수 있도록 페이지 출력 설정
router.addRoutePath('/show/', newsDetailView); // hash 값에 show가 있을 때엔 newsDetailView를 출력할 수 있도록 페이지 출력 설정

router.route();