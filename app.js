const container = document.getElementById('root')
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';

function getData(url) {
	ajax.open('GET', url, false) // 데이터를 동기적으로 가져오겠다.
	ajax.send(); // 데이터를 가져온다.

	return JSON.parse(ajax.response);
}

function newsFeed() {
	const newsFeed = getData(NEWS_URL);
	const newsList = [];

	newsList.push('<ul>')

	newsFeed.forEach(feed => {
		newsList.push(`<li><a href='#${feed.id}'>${feed.title} (${feed.comments_count})</a></li>`)
	});

	newsList.push('</ul>')
	// console.log(newsList);
	container.innerHTML = newsList.join('');
}

function newsDetail() {
	// console.log('해시가 변경되었습니다.')
	// console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
	const id = location.hash.substr(1) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장
	const newsContent = getData(CONTENT_URL.replace('@id', id));

	container.innerHTML = `<h1>${newsContent.title}</h1><div><a href='#'>목록으로</div>`;
}


// 해쉬값에 따라 어떤 함수를 실행하여 사용자에게 제공할 것인지리를 판단하는 함수.
// 화면 전환의 주요 쟁점
function router() {
	const routePath = location.hash;

	if (routePath === '') {
		newsFeed();
	} else {
		newsDetail();
	}
}

window.addEventListener('hashchange', router);

router();