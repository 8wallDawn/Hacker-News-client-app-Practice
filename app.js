const ajax = new XMLHttpRequest();
const NEWS_URL = 'https://api.hnpwa.com/v0/news/1.json'
ajax.open('GET', NEWS_URL, false) // 데이터를 동기적으로 가져오겠다.
ajax.send(); // 데이터를 가져온다.

const newsFeed = JSON.parse(ajax.response);
const ul = document.createElement('ul');

// console.log(newsFeed)
// document.getElementById('root').innerHTML = `<ul>
//     <li>${newsFeed[0].title}</li>
//     <li>${newsFeed[1].title}</li>
//     <li>${newsFeed[2].title}</li>
// </ul>`;
document.getElementById('root').appendChild(ul);

newsFeed.forEach(feed => {
    const li = document.createElement('li')
    ul.appendChild(li)
    li.innerHTML = `${feed.title}`
});