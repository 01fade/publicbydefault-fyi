import * as PIXI from 'pixi.js';

module.exports = {
    pause: function() {
        $("#playfood").text("Play");
        window.playstate = false;
    },
    setup: function(div, origData) {
        var self = this;
        // console.log("%cshow simulation " + div, 'color: #00f');
        let container = $("#" + div);
        window.playstate = false;
        container.find(".play").click(function(e) {
            if (window.playstate === false) {
                $(this).text("Pause");
                window.playstate = true;
            } else {
                self.pause();
            }
        });
        let appW = Math.min(window.innerWidth, 680),
            appH = 150;
        let app = new PIXI.Application({
            width: appW,
            height: appH,
            antialias: true,
            transparent: true,
            resolution: 2,
            autoResize: true
        });
        container.find(".simulation").append(app.view);

        this.addingStuff(app, container, origData);
    },
    addingStuff: function(app, container, orders) {
        var self = this;
        let Application = PIXI.Application,
            loader = PIXI.loader,
            resources = PIXI.loader.resources,
            Sprite = PIXI.Sprite,
            TextureCache = PIXI.utils.TextureCache,
            Texture = PIXI.Texture,
            Rectangle = PIXI.Rectangle,
            TextStyle = PIXI.TextStyle,
            Text = PIXI.Text,
            Container = PIXI.Container,
            graphics = new PIXI.Graphics();
        let endtime = moment.utc("2018-01-01T07:00:00").utcOffset(-7);
        let time = moment.utc("2017-01-01T07:00:00").utcOffset(-7);
        let simState = "home"; // go, back, buy, end

        let centerX = app.screen.width / 2,
            centerY = app.screen.height / 2,
            width = app.screen.width,
            height = app.screen.height,
            wrapwidth = 90;

        let msgstyle = new TextStyle({
            fontSize: 18,
            fontWeight: 'bold',
            fill: "#004A98",
            align: "center",
            wordWrap: true,
            wordWrapWidth: wrapwidth
        });

        let timeArr = [];
        for (var i = 0; i < orders.length; i++) {
            timeArr[i] = moment.utc(orders[i].created_time).utcOffset(-7);
        };

        var timeI = 0;
        var hold = 0;
        var speed = 2;

        let texOrder, texDone, texCart, texCal;
        let cart, customer, message, emoji;
        let $date = container.find("#date"),
            $time = container.find("#time"),
            $count = container.find("#count");

        //////////////////////////////////////////

        loader.add("media/sprite.png").load(setup);

        function addGraphics() {
            graphics.lineStyle(0, 0x000000, 0.6);
            graphics.beginFill(0xCCCCCC, 1);
            graphics.drawRoundedRect(10, height - 15, width - 20, 30, 5);
            graphics.beginFill(0x8eb4c5, 0.8);
            graphics.drawRect(10, height - 10, width - 20, 20);
            graphics.endFill();
            app.stage.addChild(graphics);
        }

        function setup() {
            let mySprite = PIXI.BaseTexture.from("media/sprite.png");
            texDone = new Texture(mySprite, new Rectangle(600, 600, 100, 130));
            texOrder = new Texture(mySprite, new Rectangle(700, 600, 100, 130));
            texCart = new Texture(mySprite, new Rectangle(800, 600, 250, 200));

            addGraphics();

            cart = new Sprite(texCart);
            // cart.anchor.set(1, 1);
            cart.width = 125;
            cart.height = 100;
            cart.position.set(width - 150, height - 105);
            app.stage.addChild(cart);

            customer = new Container();
            app.stage.addChild(customer);
            message = new Text("Elote", msgstyle);
            message.visible = false;
            message.anchor.set(0.5, 0);
            message.x = wrapwidth / 2;
            emoji = new Sprite(texOrder);
            emoji.anchor.set(0.5, 0);
            emoji.width = 50;
            emoji.height = 65;
            emoji.x = wrapwidth / 2;
            emoji.y = message.height + 30;
            customer.addChild(emoji);
            customer.addChild(message);
            customer.pivot.x = message.width;
            customer.pivot.y = emoji.height + message.height + 10;
            customer.x = 100;
            customer.y = height - 30;

            init();
        }

        var $elote = $("#elote"),
            $mango = $("#mango"),
            $gracias = $("#gracias"),
            $raspado = $("#raspado"),
            $tostilocos = $("#tostilocos"),
            $takilocos = $("#takilocos"),
            $papas = $("#papas"),
            $diablito = $("#diablito"),
            $chicharron = $("#chicharron"),
            $esquite = $("#esquite");
        var eloteNum = 0,
            mangoNum = 0,
            graciasNum = 0,
            raspadoNum = 0,
            tostilocosNum = 0,
            takilocosNum = 0,
            papasNum = 0,
            diablitoNum = 0,
            chicharronNum = 0,
            esquiteNum = 0;

        function countMessage(msg) {
            if (msg.indexOf("elote") > -1) {
                eloteNum++;
                $elote.text(eloteNum);
            }
            if (msg.indexOf("mango") > -1) {
                mangoNum++;
                $mango.text(mangoNum);
            }
            if (msg.indexOf("gracias") > -1) {
                graciasNum++;
                $gracias.text(graciasNum);
            }
            if (msg.indexOf("raspado") > -1) {
                raspadoNum++;
                $raspado.text(raspadoNum);
            }
            if (msg.indexOf("tostilocos") > -1) {
                tostilocosNum++;
                $tostilocos.text(tostilocosNum);
            }
            if (msg.indexOf("takilocos") > -1) {
                takilocosNum++;
                $takilocos.text(takilocosNum);
            }
            if (msg.indexOf("papas") > -1) {
                papasNum++;
                $papas.text(papasNum);
            }
            if (msg.indexOf("diablito") > -1) {
                diablitoNum++;
                $diablito.text(diablitoNum);
            }
            if (msg.indexOf("chichar") > -1) {
                chicharronNum++;
                $chicharron.text(chicharronNum);
            }
            if (msg.indexOf("esquite") > -1) {
                esquiteNum++;
                $esquite.text(esquiteNum);
            }
        };

        function play() {
            if (simState === "end") {
                $count.text(timeI);
                eloteNum = 0;
                mangoNum = 0;
                graciasNum = 0;
                raspadoNum = 0;
                tostilocosNum = 0;
                takilocosNum = 0;
                papasNum = 0;
                diablitoNum = 0;
                chicharronNum = 0;
                esquiteNum = 0;
                $elote.text(eloteNum);
                $mango.text(mangoNum);
                $gracias.text(graciasNum);
                $raspado.text(raspadoNum);
                $tostilocos.text(tostilocosNum);
                $takilocos.text(takilocosNum);
                $papas.text(papasNum);
                $diablito.text(diablitoNum);
                $chicharron.text(chicharronNum);
                $esquite.text(esquiteNum);
                emoji.texture = texOrder;
                simState = "home";
            } else if (simState === "home") {
                message.visible = false;
                if (timeI < timeArr.length) {
                    message.text = orders[timeI].message;
                } else {
                    timeI = 0;
                }
                if (endtime.diff(time, "hours") < 0) {
                    time = moment.utc("2017-01-01T07:00:00").utcOffset(-7);
                    $date.text("");
                    $time.text("");
                    simState = "end";
                    self.pause();
                } else {
                    time = time.add(4, "hour");
                    var orderToTime = timeArr[timeI].diff(time, "minutes");
                    var showTime0 = time.format("MMM DD");
                    var showTime1 = time.format("hh:mm a");
                    if (orderToTime < 4 * 60 && orderToTime > 0) {
                        showTime0 = timeArr[timeI].format("MMM DD");
                        showTime1 = timeArr[timeI].format("hh:mm a");
                        timeI++;
                        $count.text(timeI);
                        simState = "go";
                    }
                    $date.text(showTime0);
                    $time.text(showTime1);
                }
            } else if (simState === "go") {
                if (customer.position._x < width - (cart.width + wrapwidth / 2 + Math.min(4 * speed, 20))) {
                    emoji.texture = texOrder;
                    customer.x += 5 * speed;
                } else {
                    simState = "buy";
                }
            } else if (simState === "buy") {
                if (hold < 220 / speed) {
                    if (hold === 0) countMessage(message.text.toLowerCase());
                    message.visible = true;
                    hold++;
                } else {
                    simState = "back";
                }
            } else if (simState === "back") {
                hold = 0;
                if (customer.position._x > 100) {
                    customer.x -= 4 * speed;
                    emoji.texture = texDone;
                } else {
                    simState = "home";
                }
            }

        }; // end of play

        function init() {
            app.ticker.add(function(delta) {
                if (playstate) {
                    play();
                }
            });
        };

        $(window).resize(function() {
            width = Math.min(window.innerWidth, 680);
            centerX = width / 2;
            cart.position.set(width - 150, height - 105);
            graphics.clear();
            addGraphics();
            app.renderer.resize(width, height);
        });

        container.find(".speed").click(function(e) {
            container.find(".speed").removeClass("active");
            $(this).addClass("active");
            switch (e.target.id) {
                case "speed0":
                    speed = 2;
                    break;
                case "speed1":
                    speed = 6;
                    break;
                case "speed2":
                    speed = 10;
                    break;
            }
        });


    } // of adding stuff
}