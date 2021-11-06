const container = document.getElementById('root')
const ajax = new XMLHttpRequest();
const content = document.createElement('div');
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'

ajax.open('GET', NEWS_URL, false) // 데이터를 동기적으로 가져오겠다.
ajax.send(); // 데이터를 가져온다.

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul');

const CONTENT_URL = 'https://api.hnpwa.com/v0/item/@id.json';
window.addEventListener('hashchange', function() {
    // console.log('해시가 변경되었습니다.')
    // console.log(this.location) url 주소에 대한 정보로 hash에 대한 값을 추출 가능.
    const id = this.location.hash.substr(1) // #으로 시작하는 해쉬값에서 #을 제거하여 id 값만을 순수하게 추출하여 저장

    ajax.open('GET', CONTENT_URL.replace('@id', id), false);
    ajax.send();

    const newsContent = JSON.parse(ajax.response);
    const title = document.createElement('h1');

    title.innerHTML = newsContent.title
    content.appendChild(title)
    console.log(newsContent);
});


// console.log(newsFeed)
// document.getElementById('root').innerHTML = `<ul>
//     <li>${newsFeed[0].title}</li>
//     <li>${newsFeed[1].title}</li>
//     <li>${newsFeed[2].title}</li>
// </ul>`;

newsFeed.forEach(feed => {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.href=`#${feed.id}`;
    ul.appendChild(li);
    li.appendChild(a);
    a.innerHTML = `${feed.title} (${feed.comments_count})`;
    
});

container.appendChild(ul);
container.appendChild(content);