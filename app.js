const $ =document.querySelector.bind(document);
const $$ =document.querySelectorAll.bind(document);

const PLAY_STORAGE_KEY = 'F8_PLAYER '

const player = $('.player')
const cd = $('.cd');
const cdWidth = cd.offsetWidth;
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const playBtn = $('.btn-toggle-play');
const progess = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $(".playlist");

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    //config: JSON.parse.getItem(PLAY_STORAGE_KEY) || {},
    songs: [
        {
            name: 'Lặng im đến lúc nào',
            singer: 'Erik',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Qua ngày mai',
            singer: 'Tiên Tiên',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'KOSAO',
            singer: 'Kid',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Phonk brazialian',
            singer: 'Brazin',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: 'Nép thật sát vào',
            singer: 'Wordie',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAY_STORAGE_KEY, JSON.stringify(this.config));
    },
   //Hiển thị bài hát
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active': ''}" data-index = "${index}">
                <div class="thumb" style="background-image: url(${song.image})">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>
            `
        })
        
      playlist.innerHTML = htmls.join('');
    },

    defineProperties: function() {
        Object.defineProperty(this,'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },

    handleEvents: function() {
        const _this = this;

        //Xử lý CD quay và dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'} //quay 360 độ
        ], {
            duration: 10000, // 10s
            interations: Infinity //quay vô hạn
        })
        cdThumbAnimate.pause();

        //Xử lý kéo lên, xuống nó sẽ phóng to và thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;


            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth;

        }

        //Xử lý khi click
        playBtn.onclick = function() {
            if(_this.isPlaying){
                audio.pause();
            }
            else {
                audio.play();
            }
        }

        //Khi nhạc đc play
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        //Khi nhạc đc pause
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        //Khi tiến độ thay đổi
        audio.ontimeupdate = function() {
            if(audio.duration) {
                const progessPercent = Math.floor(audio.currentTime / audio.duration * 100);
                progess.value = progessPercent;
            }
        }

        //Xử lý khi tua bài nhạc
        progess.oninput = function(e) {
            const seekTime = audio.duration / 100 * e.target.value;
            audio.currentTime = seekTime;
        }

        //Khi chuyển bài hát
        nextBtn.onclick = function() {
            if(_this.isRandom){
                //Nếu mà nhấn random thì sẽ chạy playRandomSong
                _this.playRandomSong();
            }
            else {
                _this.nextSong();
            }
            
            audio.play();
            _this.render();
            _this.scrollToActiveSong();
        }

        //Khi chuyển về trước
        prevBtn.onclick = function() {
            //Nếu mà nhấn random thì sẽ chạy playRandomSong
            if(_this.isRandom){
                _this.playRandomSong();
            }
            else {
                _this.prevSong();
            }
            audio.play();
            _this.render();
            _this.scrollToActiveSong();


        }

        //Khi nhấn nút random bật / tắt
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRandom)
            
        }

        //Xử lý phát lại 1 bài nhạc
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            _this.setConfig('isRepeat', _this.isRepeat);

            repeatBtn.classList.toggle('active', _this.repeatBtn)
        }

        //Xử lý next nhạc khi hết nhạc
        audio.onended = function() {
            //Nếu mà nhấn repeat thì 
            if(_this.isRepeat) {
                audio.play();
            }
            else{
                nextBtn.click();
            }
            
        }

        //Lắng nghe click vào tên bài hát(playlist)
        playlist.onclick = function (e) {
        const songNode = e.target.closest(".song:not(.active)");

        if (songNode || e.target.closest(".option")) {
        // Xử lý khi click vào song
        // Handle when clicking on the song
        if (songNode) {
          _this.currentIndex = Number(songNode.dataset.index);
          _this.loadCurrentSong();
          _this.render();
          audio.play();
        }

        // Xử lý khi click vào song option
        // Handle when clicking on the song option
        if (e.target.closest(".option")) {
        }
      }
    };

    },

    //Tải bài hát hiện tại
    loadCurrentSong: function() {
        
        
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url(${this.currentSong.image})`;
        audio.src = this.currentSong.path;

    },

    loadConfig: function () {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    scrollToActiveSong: function() {
        setTimeout(() =>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },

    //Chuyển bài hát
    nextSong: function() {
        //Chuyển bài
        this.currentIndex++;
        //Nếu currentIndex vượt qua số lượng trong songs 
        if(this.currentIndex >= this.songs.length ) {
            //thì sẽ trở lại bài hát đầu
            this.currentIndex = 0;
        }
        this.loadCurrentSong();
    },
    //Chuyển bài hát về phía trước
    prevSong: function() {
        this.currentIndex--;
        //Nếu trở về đầu bài 1 lần nữa thì 
        if(this.currentIndex < 0) {
            //thì quay trở lại bài cuối
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong();
    },
    //Chuyển bài random
    playRandomSong: function() {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while(newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong();
    },


    start: function() {
        //gán config vào object
        //this.loadConfig();

        //lấy bài hát đầu tiên
        //Định nghĩa các thuột tính
        this.defineProperties();

        //Lắng nghe các sự kiện
        this.handleEvents()

        //Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();


        //Render lại dsach bài hát
        this.render()
    }
}
app.start();
