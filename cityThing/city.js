(function(){
    var cityContainer = document.createElement('div');
    cityContainer.id = "cityContainer";
    document.body.appendChild(cityContainer);
    var sequence = [
        {class: 'night',     time: 10, lightsOn:  1},
        {class: 'morning-1', time:  5, lightsOn:  5},
        {class: 'morning-2', time:  5, lightsOn: 10},
        {class: 'morning-3', time:  5, lightsOn: 50},
        {class: 'day',       time: 10, lightsOn: 90},
        {class: 'evening-1', time:  5, lightsOn: 40},
        {class: 'evening-2', time:  5, lightsOn: 10},
        {class: 'evening-3', time:  5, lightsOn:  1},
    ];
    var stage = 0;
    function tick(){
        document.body.classList.remove.apply(document.body.classList, sequence.map(function(item){
            return item.class;
        }));
        ++stage;
        stage %= sequence.length;
        document.body.classList.add(sequence[stage].class);
        setTimeout(tick, sequence[stage].time * 1000);
    }
    setTimeout(tick, sequence[0].time * 1000);

    function rand(min, max){
        return Math.floor(Math.random() * (max - min)) + min;
    }

    function Window(){
        this.el = document.createElement('span');
        this.el.className = 'window';
        var tick = function(){
            if(rand(0, 100) < sequence[stage].lightsOn){
                this.el.classList.add('on');
            } else {
                this.el.classList.remove('on');
            }
            setTimeout(tick, rand(6, 20) * 500);
        }.bind(this);
        tick();
    }
    Window.constructor = Window;
    Window.prototype = {};

    function SkyScrapper(){
        this.el = document.createElement('span');
        this.el.className = 'sky-scrapper';
        let stories = rand(10, 20);
        const windowsperstory = 8;
        for(let i = 0; i < stories * windowsperstory; ++i){
            this.el.appendChild((new Window()).el);
        }
    }
    SkyScrapper.constructor = SkyScrapper;
    SkyScrapper.prototype = {};

    function buildCity(){
        let scrappers = rand(3, 9);
        while(scrappers--){
            let scrapper = new SkyScrapper();
            cityContainer.appendChild(scrapper.el);
        }
    }

    buildCity();
})();
