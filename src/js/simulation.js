import * as PIXI from 'pixi.js';

module.exports = {
    prepareData: function(data) {
        let starttime = moment.utc("2017-01-01T00:00:00").utcOffset(-7);
        let endtime = moment.utc("2018-01-01T00:00:00").utcOffset(-7);
        let duration = endtime.diff(starttime, 'minutes');
        let chunksize = 60;
        let timeChunks = duration / chunksize;

        console.log(timeChunks);

        // for (var i = 0; i < timeChunks; i++) {
        //     // check if there was a transaction in the last 30 minutes
        //     var happenedLast = _.filter(data, function(o) {
        //         let now = moment.utc(o.created_time).utcOffset(-7);
        //         let start2now = now.diff(starttime, "minutes");
        //         let chunk1 = i * chunksize;
        //         let chunk2 = chunk1 + chunksize;

        //         return start2now > chunk1 && start2now < chunk2;
        //     });

        //     console.log(happenedLast.length);
        // }
    },
    pause: function() {
        $("#playfood").text("Play");
        window.playstate = false;
    },
    setup: function(div, origData) {
        var self = this;
        console.log("show", div);
        let container = $("#" + div);
        window.playstate = false;
        container.find(".play").click(function(e) {
            // toggle
            if (window.playstate === false) {
                $(this).text("Pause");
                window.playstate = true;
            } else {
                self.pause();
            }
        });
        let newArr = this.prepareData(origData);
        let app = new PIXI.Application({
            width: Math.min(window.innerWidth, 680), // default: 800
            height: 300, // default: 600
            antialias: true, // default: false
            backgroundColor: 0x56c0e3,
            transparent: false, // default: false
            resolution: 1 // default: 1
        });
        //Add the canvas that Pixi automatically created for you to the HTML document
        container.find(".simulation").append(app.view);

        $(window).resize(function() {
            app.renderer.autoResize = true;
            app.renderer.resize(Math.min(window.innerWidth, 650), 400);
        })

        this.addingStuff(app, origData);
    },
    addingStuff: function(app, orders) {
        let Application = PIXI.Application,
            loader = PIXI.loader,
            resources = PIXI.loader.resources,
            Sprite = PIXI.Sprite,
            TextureCache = PIXI.utils.TextureCache,
            Texture = PIXI.Texture,
            Rectangle = PIXI.Rectangle,
            TextStyle = PIXI.TextStyle,
            Text = PIXI.Text,
            Container = PIXI.Container;
        let endtime = moment.utc("2018-01-01T00:00:00").utcOffset(-7);
        let time = moment.utc("2017-01-01T00:00:00").utcOffset(-7);

        let centerX = app.screen.width / 2,
            centerY = app.screen.height / 2;

        let style = new TextStyle({
            fontSize: 16,
            fill: "#fff",
            stroke: '#004A98',
            strokeThickness: 3,
            dropShadow: true,
            dropShadowColor: '#004A98',
            dropShadowBlur: 0,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 3,
        });

        let msgstyle = new TextStyle({
            fontSize: 18,
            fill: "#004A98",
            align: "center",
            wordWrap: true,
            wordWrapWidth: 80
        });

        /////////////////////////////////

        loader.add("media/sprite.png").load(setup);
        let texOrder, texDone, texCart;

        function setup() {
            let mySprite = PIXI.BaseTexture.from("media/sprite.png");
            texOrder = new Texture(mySprite, new Rectangle(0, 0, 100, 100));
            texDone = new Texture(mySprite, new Rectangle(200, 0, 100, 100));
            texCart = new Texture(mySprite, new Rectangle(400, 0, 100, 100));
            init();
        }

        function init() {
            var richText = new Text("2017", style);
            richText.position.set(10, 10);
            app.stage.addChild(richText);

            var cart = new Sprite(texCart);
            cart.anchor.set(0.5);
            cart.scale.set(0.8);
            cart.position.set(centerX, centerY);
            app.stage.addChild(cart);

            var ppll = [],
                pplr = [];

            function createPerson(i, left) {
                var container = new Container();
                app.stage.addChild(container);

                var message = new Text(orders[i].message, msgstyle);
                message.position.set(0, 0);
                message.visible = false;

                var person = new Sprite(texOrder);
                person.anchor.set(0.5, 0);
                person.scale.set(0.5);
                person.x = message.width / 2;
                person.y = message.height + 10;

                container.addChild(person);
                container.addChild(message);

                container.pivot.x = container.width;
                container.pivot.y = container.height / 2;

                // var timeofday = moment(ordersp[i].created_time).subtract("7", hours).hour();

                container.x = left === "l" ? (0 - person.width) : (app.screen.width + person.width);
                let min = 10,
                    max = 30;
                container.y = centerY - Math.floor(Math.random() * (max - min + 1)) + min;

                if (left === "l") {
                    ppll.push(container);
                } else {
                    pplr.push(container);
                }
            }

            var indexl = 0;
            var indexr = 0;

            function checkToCreatePeople() {
                if (ppll.length === 0) {
                    createPerson(indexl, "l");
                    indexl++;
                }

                if (pplr.length === 0) {
                    createPerson(indexr, "r");
                    indexr++;
                }
            }

            // first time
            checkToCreatePeople();

            app.ticker.add(function(delta) {
                if (playstate) {
                    play();
                }
            });

            function play() {
                if (endtime.diff(time, "hours") < 0) {
                    time = moment.utc("2017-01-01T00:00:00").utcOffset(-7);
                    indexl = 0;
                    indexr = 0;
                } else {
                    time = time.add(30, "minutes");
                }
                richText.text = time.format("MMMM DD");

                checkToCreatePeople();

                // move from left to center to bottom
                for (var i = 0; i < ppll.length; i++) {
                    if (ppll[i].position._x < centerX - (cart.width / 4)) {
                        ppll[i].x += 6;
                    } else {
                        ppll[i].children[1].visible = true;
                        ppll[i].children[0].texture = texDone;
                        if (ppll[i].position._y < app.screen.height + ppll[i].height) {
                            ppll[i].y += 2;
                            ppll[i].x += 0.8;
                        } else {
                            ppll[i].destroy();
                            ppll.splice(i, 1);
                        }
                    }
                }

                // move from right to center to top
                for (var i = 0; i < pplr.length; i++) {
                    if (pplr[i].position._x > centerX + (cart.width)) {
                        pplr[i].x -= 6;
                    } else {
                        pplr[i].children[1].visible = true;
                        pplr[i].children[0].texture = texDone;
                        if (pplr[i].position._y > 0 - pplr[i].height) {
                            pplr[i].y -= 2;
                            pplr[i].x -= 0.8;
                        } else {
                            pplr[i].destroy();
                            pplr.splice(i, 1);
                        }
                    }
                }

            } // end of play
        } // end of init

    } // of adding stuff
}