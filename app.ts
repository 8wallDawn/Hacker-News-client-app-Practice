type Store = {
	currentPage: number;
	feeds: NewsFeed[];
}

type NewsFeed = {
	id: number;
	comments_count : number;
	url: string;
	user: string;
	time_age: string;
	points: number;
	title: string;
	read?: boolean;
}

const container: HTMLElement | null = document.getElementById('root')
const ajax : XMLHttpRequest = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
const store: Store = {
	currentPage: 1,
	feeds: [],
}

function getData(url) {
	ajax.open('GET', url, false) // 데이터를 동기적으로 가져오겠다.
	ajax.send(); // 데이터를 가져온다.

	return JSON.parse(ajax.response);
}

function makeFeeds(feeds) {
	for( let i=0; i < feeds.length; ++i) {
		feeds[i].read = false;
	}
	return feeds;
}

function updateView(html) {
	if(container != null){
		container.innerHTML = html;
	} else {
		console.error('최상위 컨테이너가 없어 UI를 진행하지 못합니다.')
	}
}

function newsFeed() {
	let newsFeed: NewsFeed[] = store.feeds;
	const newsList = [];
	const maxPage = newsFeed.length % 10 === 0 ? newsFeed.length / 10 : newsFeed.length / 10 + 1;

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

	if(newsFeed.length === 0) {
		newsFeed = store.feeds = makeFeeds(getData(NEWS_URL));
	}
	console.log(newsFeed)

	for (let i = (store.currentPage - 1) * 10; i < store.currentPage * 10; ++i) {
    newsList.push(`
      <div class="p-6 ${newsFeed[i].read ? 'bg-red-200' : 'bg-white'} mt-6 rounded-lg shadow-md transition-colors duration-500 hover:bg-green-100">
        <div class="flex">
          <div class="flex-auto">
            <a href="#/show/${newsFeed[i].id}">${newsFeed[i].title}</a>  
          </div>
          <div class="text-center text-sm">
            <div class="w-10 text-white bg-green-300 rounded-lg px-0 py-2">${newsFeed[i].comments_count}</div>
          </div>
        </div>
        <div class="flex mt-3">
          <div class="grid grid-cols-3 text-sm text-gray-500">
            <div><i class="fas fa-user mr-1"></i>${newsFeed[i].user}</div>
            <div><i class="fas fa-heart mr-1"></i>${newsFeed[i].points}</div>
            <div><i class="far fa-clock mr-1"></i>${newsFeed[i].time_ago}</div>
          </div>  
        </div>
      </div>    
    `);
	};

	template = template.replace('{{__news_feed__}}', newsList.join(''))
	template = template.replace('{{__prev_page__}}', store.currentPage > 1 ? store.currentPage - 1 : 1)
	template = template.replace('{{__next_page__}}', store.currentPage !== maxPage ? store.currentPage + 1 : maxPage)
	
	updateView(template);
}

function newsDetail() {
	// console.log('해시가 변경되었습니다.')
	// console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
	const id = location.hash.substr(7) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장
	const newsContent = getData(CONTENT_URL.replace('@id', id));
  let template = `
    <div class="bg-gray-600 min-h-screen pb-8">
      <div class="bg-white text-xl">
        <div class="mx-auto px-4">
          <div class="flex justify-between items-center py-6">
            <div class="flex justify-start">
              <h1 class="font-extrabold">Hacker News</h1>
            </div>
            <div class="items-center justify-end">
              <a href="#/page/${store.currentPage}" class="text-gray-500">
                <i class="fa fa-times"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="h-full border rounded-xl bg-white m-6 p-4 ">
        <h2>${newsContent.title}</h2>
        <div class="text-gray-400 h-20">
          ${newsContent.content}
        </div>

        {{__comments__}}

      </div>
    </div>
  `;

	for (let i =0 ; i < store.feeds.length; ++i) {
		if(store.feeds[i].id === +id) {
			store.feeds[i].read = true;
			break;
		}
	}

	function makeComment(comments, called = 0) {
		const commentString = [];

		for(let i=0; i < comments.length; ++i) {
      commentString.push(`
        <div style="padding-left: ${called * 40}px;" class="mt-4">
          <div class="text-gray-400">
            <i class="fa fa-sort-up mr-2"></i>
            <strong>${comments[i].user}</strong> ${comments[i].time_ago}
          </div>
          <p class="text-gray-700">${comments[i].content}</p>
        </div>      
      `);

			if(comments[i].comments.length > 0) {
				commentString.push(makeComment(comments[i].comments, called+1));
			}
		}

		// console.log(commentString);
		return commentString.join('')
	}

	updateView(template.replace('{{__comments__}}', makeComment(newsContent.comments)))
}


// 해쉬값에 따라 어떤 함수를 실행하여 사용자에게 제공할 것인지리를 판단하는 함수.
// 화면 전환의 주요 쟁점
function router() {
	const routePath = location.hash;
	// console.log(routePath); // #/page/(number)

	if (routePath === '') {
		newsFeed();
	} else if (routePath.indexOf('#/page/') >= 0) {
		store.currentPage = +routePath.substr(7);
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener('hashchange', router);

router();

