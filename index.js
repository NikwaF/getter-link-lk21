const fetch = require('node-fetch');
const cheerio = require('cheerio');
const readline = require('readline-sync');


const pageFilm = (link) => new Promise((resolve, reject) => {
  fetch(link, {
    method: 'GET',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0"
    },
  })
  .then(async res => {
    const result = await res.text()
    $ = cheerio.load(result)
    const link = $('a[class="btn btn-success"]').attr('href')
    const judul = $('span[itemprop="name"]').last().text();
    
    resolve({link,judul});
  })
  .catch(err => reject(err))
});

const pageNunggu = (link) => new Promise((resolve, reject) => {
  fetch(link, {
    method: 'GET',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0"
    },
  })
  .then(async res => {
    const result = await res.text();
    $ = cheerio.load(result)
    const ress = `http://` + link.split('/')[2] + $('frame').attr('src');
    resolve(ress);
  })
  .catch(err => reject(err))
});


const pageDalamNunggu = (link) => new Promise((resolve, reject) => {
  fetch(link, {
    method: 'GET',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0"
    },
  })
  .then(async res => {

    const result = await res.text()
    $ = cheerio.load(result)
    const ress = $('a[target="_parent"]').attr('href')
    resolve(ress)
  })
  .catch(err => reject(err))
});




const testCookie = (link) => new Promise((resolve,reject) => {
  fetch(link, {
    method: 'GET',
    header: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0"
    }
  })
  .then(async res => {
    var ehehe = [];
    res.headers.raw()['set-cookie'].forEach(element => {
      ehehe.push(element.split(';')[0]+';')
    });
    const result = await res.text()
    const ress = 
    {
        link: `https://` + link.split('/')[2] + result.split('$.post("')[1].split('"')[0],
        bodi: result.split('}).done(')[0].split('{')[1].split('?')[1].split('"')[0],
        cookie:`${ehehe.join('')} _ga=GA1.2.658651104.1587402312; _gid=GA1.2.729933755.1587402312; __asc=10283a85171988d0ae80d16e6eb; __auc=10283a85171988d0ae80d16e6eb; _gat=1; `
    }

    resolve(ress);
  })
});


const getDownloadLink = (data) => new Promise((resolve,reject) => {
  fetch(data.link, {
    method: 'POST',
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate, br",
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      Cookie: data.cookie
    },
    body: data.bodi
  })
  .then(async res => {
    const html = await res.text();
    $ = cheerio.load(html);
    const arr = new Array;
    const linknya = [];
    const zz = [];

    $('a[target="_blank"]').each(function(i,item){
      arr.push(`[${i+1}] ${$(this).attr('class').replace('btnx btn-','')}p => ${$(this).attr('href')}`);
      linknya.push(`${$(this).attr('href')}`);
    });

    linknya.forEach(item => {
      if(item.includes('layarkacaxxi.org')){
        zz.push(item.split('/')[4]);
      }
    });

    const resultnya = {
      arr,
      zz: zz[0]
    }

    resolve(resultnya);
  });
});


const link_direct = (id) => new Promise((resolve,reject) => {
  fetch(`https://layarkacaxxi.org/api/source/${id}`,{method:'POST'})
  .then(async res => {
    resolve(await res.json());
  })
});

const shortlink = (link) => new Promise((resolve, reject) => {
  fetch(`https://tinyurl.com/api-create.php?url=${link}`, {
      method: 'GET',
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:75.0) Gecko/20100101 Firefox/75.0",
      }
  })
  .then(async res => {
      const result = await res.text()
      resolve(result)
  })
  .catch(err => reject(err))
});



(async () => {
  try{
    while(true){
      try{
        const link_film = readline.question('[#] link filmnya : ');
        const ke_film = await pageFilm(link_film);
        console.log(`judul => ${ke_film.judul}\n`);
        const redirect = await pageNunggu(ke_film.link);
        const skip_redirect = await pageDalamNunggu(redirect);
        const get_cookie_download = await testCookie(skip_redirect);
        const dapet_download_link = await getDownloadLink(get_cookie_download);
        if(dapet_download_link.length === 0){
          console.log('ada kesalahan\n');
          break;
        }       

        console.log(`"sukses" => dapet link mirror\n${dapet_download_link.arr.join('\n')}\n`);

        if(dapet_download_link.zz === undefined){
          break;
        }

        const direct_url = await link_direct(dapet_download_link.zz);

        if(direct_url.success === false){
          break;
        }

        const linknya_woi = [];

        for(let i=0;i <= direct_url.data.length -1;i++){
          linknya_woi.push(`[${i + 1}] ${direct_url.data[i].label} => ${await shortlink(direct_url.data[i].file)}`);
        }

        console.log(`"sukses" => dapet link direct\n${linknya_woi.join('\n')}\n`);
        
      }catch(err){
        console.log('"gagal" => gak dapet link direct');
      }
    }
  } catch(err){
    console.log(err);
  }
  
})();