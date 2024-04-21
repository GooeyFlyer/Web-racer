document.addEventListener('DOMContentLoaded', () => {

    let canvas = document.getElementById("canvas")
    let best_time_p1 = document.getElementById("best_time1")
    let score_p1 = document.getElementById("score1")
    let best_time_p2 = document.getElementById("best_time2")
    let score_p2 = document.getElementById("score2")

    var draw_circles = false;

    document.getElementById("toggleCircles").addEventListener("click", function() {
        draw_circles = !draw_circles; // Toggles between true and falseada
        console.log("Current value: " + draw_circles);
    })

    let context = canvas.getContext("2d")
    let game = true
    let mode = "hard"

    function drawBackground() {
        context.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    }

    if (mode == "hard") {
        var backgroundImage = new Image();
        backgroundImage.src = 'track2.png';
        backgroundImage.onload = function() {
            drawBackground();
        };
    }
    else {
        var backgroundImage = new Image();
        backgroundImage.src = 'track1.png';
        backgroundImage.onload = function() {
            drawBackground();
        };
    }

    var window_height = window.innerHeight
    var window_width = window.innerWidth

    canvas.width = 1440
    canvas.height = 750


    class Circle {
        constructor(xpos, ypos, radius, color) {
            this.xpos = xpos
            this.ypos = ypos
            this.radius = radius
            this.color = color
        }

        draw(context) {
            if (draw_circles) {
                context.beginPath()
                context.strokeStyle = this.color
                context.lineWidth = 5

                context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI*2, false)
                context.stroke()
                context.closePath()
            }
        }



        update() {
            this.draw(context)
        }
    }

    class Oil {
        constructor(xpos, ypos, radius, color, image) {
            this.xpos = xpos
            this.ypos = ypos
            this.radius = radius
            this.color = color
            this.image_size = 0.08
            this.image = image
            this.active = true
            this.savedTime = 2000
            this.respawnTime = this.savedTime
        }

        draw(context) {
            if (this.active) {
                context.drawImage(this.image, (this.xpos- this.image_size*1920 / 2), (this.ypos- this.image_size*1920 / 2), this.image_size*1920, this.image_size*1920)

                if (draw_circles) {
                    context.beginPath()
                    context.strokeStyle = this.color
                    context.lineWidth = 5

                    context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI*2, false)
                    context.stroke()
                    context.closePath()
                }
            }
        }



        update() {
            this.draw(context)
        }
    }

    class Gate {
        constructor(color) {
            this.color = color
        }

        draw(context) {
            context.beginPath()
            context.lineWidth = 20
            context.strokeStyle = this.color

            if (mode === "easy") {
                var startX = canvas.width/2
                var startY = canvas.height/2 + 103

                var endX = canvas.width/2
                var endY = canvas.height - 100
            }
            else {
                var startX = canvas.width/2
                var startY = canvas.height/2 + 78

                var endX = canvas.width/2
                var endY = canvas.height - 78
            }

            context.moveTo(startX, startY); // Move the pen to the starting point
            context.lineTo(endX, endY); // Draw a line to the ending point
            context.stroke()
            context.closePath()
        }



        update() {
            this.draw(context)
        }
    }

    class Car {
        constructor(xpos, ypos, radius, color, text, speed, image, best_time_p, score_p) {
            this.xpos = xpos
            this.ypos = ypos
            this.radius = radius
            this.speed = speed

            this.savedColor = color
            this.color = color
            this.text = text

            this.dx = 1 * speed
            this.dy = 1 * speed
            this.angle = Math.PI
            this.image = image

            this.touching_gate = false
            this.crash = false
            this.moving = true
            this.spinning = false

            this.startTime = 0

            this.best_time = 9999999
            this.score = -1
            this.best_time_p = best_time_p
            this.score_p = score_p
        }

        draw(context) {
            
            let ctx = context
            ctx.save();
            var image_size = 0.13

            // Translate to the position where you want to draw the image
            ctx.translate(this.xpos, this.ypos);

            // Rotate the canvas by the angle (radians)
            ctx.rotate(this.angle)

            // Draw the image centered on its own center
            ctx.drawImage(this.image, -image_size*1500 / 2, -image_size*844 / 2, image_size*1500, image_size*844)

            // Restore the context to its previous state
            ctx.restore();


            if (draw_circles) {
                context.beginPath()
                context.strokeStyle = this.color
                context.lineWidth = 5

                context.textAlign = "center"
                context.textBaseline = "middle"

                context.fillText(this.text, this.xpos, this.ypos)

                context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI*2, false)

                context.stroke()
                context.closePath()
            }
        }

        async crashing() {
            this.moving = false
            this.speed = 0

            await waitTime(750)

            this.xpos = canvas.width/2 + 100
            this.ypos = 565
            this.angle = Math.PI

            this.moving = true
        }

        async spin() {
            this.moving = false
            this.speed = 0

            for(var i=0; i< 50; i++) {
                await waitTime(10)
                this.angle += Math.PI/25
            }


            this.moving = true
        }

        checkGate() {
            if ((canvas.width/2 -3 < this.xpos) && (this.xpos < canvas.width/2 +3) && (canvas.height/2+100 < this.ypos) && (this.ypos < canvas.height-100)) {
                if (!this.touching_gate) {
                    this.score += 1
                    this.score_p.innerHTML = this.score
    
                    if (this.score > 0) {
                        var elapsed_time = performance.now()-this.startTime
    
                        var seconds = Math.floor(elapsed_time / 1000);
                        var milliseconds = elapsed_time % 1000;
                        milliseconds = milliseconds.toFixed(2)
    
                        if (elapsed_time < this.best_time) {
                            this.best_time = elapsed_time
                            this.best_time_p.innerHTML = seconds + ' s ' + milliseconds + ' ms '
                        }
                        this.startTime = performance.now()
                    }
                    else {
                        this.best_time_p.innerHTML = "Complete a full lap"
                    }
                }
                this.touching_gate = true
            }
            else {
                this.touching_gate = false
            }
        }

        calculate_speed(delta) {
            if (delta < 0) {
                return -1 * this.speed
            }
            else {
                return 1 * this.speed
            }
        }

        calculate_direction() {
            this.dx = Math.tan(angle) * this.dy
        }

        car_change_speed(value) {
            this.speed += value
        }

        car_change_direction(value, turn_rate) {
            if (value > 0) {
                this.angle += turn_rate
            }
            else {
                this.angle -= turn_rate
            }
        }

        update() {
            this.draw(context)

            this.dx = this.speed * Math.cos(this.angle)
            this.dy = this.speed * Math.sin(this.angle)
            //console.log(this.angle)

            if ((this.xpos + this.radius) > canvas.width) {
                this.dx = -this.dx
            }
            if ((this.xpos - this.radius) < 0) {
                this.dx = -this.dx
            }

            if ((this.ypos + this.radius) > canvas.height) {
                this.dy = -this.dy
            }
            if ((this.ypos - this.radius) < 0) {
                this.dy = -this.dy
            }

            this.xpos += this.dx
            this.ypos += this.dy
        }
    } 

    function add_circle(xposC, yposC) {
        let my_circle = new Circle(xposC, yposC, circle_radius, "red")
        circles.push(my_circle)
    }

    let getDistance = function(xpos1, ypos1, xpos2, ypos2) {
        return Math.sqrt(Math.pow(xpos2-xpos1, 2) + Math.pow(ypos2 - ypos1, 2))
    }

    var img1 = new Image()
    // image source is https://www.rawpixel.com/image/8705143/png-plant-people
    img1.src = "car.png"

    var img2 = new Image()
    // image source is https://www.rawpixel.com/image/8705143/png-plant-people
    img2.src = "car2.png"

    let my_car1 = new Car(canvas.width/2 + 100, 565, 50, "blue", "car 1", 0, img1, best_time_p1, score_p1)
    let my_car2 = new Car(canvas.width/2 + 100, 565, 50, "green", "car 2", 0, img2, best_time_p2, score_p2)
    let cars = [my_car1, my_car2]

    var oilImg = new Image()
    // image source is https://www.vecteezy.com/vector-art/10685313-black-ink-spot-and-dots-drops-and-splashes-blots-of-liquid-paint-watercolor-grunge-vector-illustration
    oilImg.src = "oilSpill.png"

    let oil1 = new Oil(220, canvas.height/2, 30, "red", oilImg)
    let oil2 = new Oil(canvas.width-220, canvas.height/2, 30, "red", oilImg)
    let oils = [oil1, oil2]
    
    let gate = new Gate("blue")

    let circles = []
    
    if (mode === "hard") {
        circle_radius = 75
        add_circle(canvas.width/2-250, 70)
        add_circle(canvas.width/2+250, 70)
        add_circle(canvas.width/2, canvas.height/2 -70)

        add_circle(100, 75)
        add_circle(canvas.width-100, 75)
        add_circle(100, canvas.height-75)
        add_circle(canvas.width-100, canvas.height-75)
    }

    else {circle_radius = 100}

    for (var i = canvas.width/2-300; i < canvas.width-400; i+= 50) {
        add_circle(i, canvas.height/2)
    }

    for (var i = 0; i < canvas.width; i+= 50) {
        // bottom row
        add_circle(i, canvas.height)
    }
    for (var i = 0; i < canvas.width; i+= 50) {
        // top row
        add_circle(i, 0)
    }
    for (var i = 0; i < canvas.height; i+= 50) {
        // left row
        add_circle(30, i)
    }
    for (var i = 0; i < canvas.height; i+= 50) {
        // right row
        add_circle(canvas.width-30, i)
    }
    
    
    function change(e) {
        e.preventDefault()
        
        let turn_rate = 0.2
        let acceleration = 1
        if (my_car1.moving) {
            switch(e.keyCode) {
                case 37:
                    // left 1
                    my_car1.car_change_direction(-1, turn_rate)
                    break

                case 38:
                    // up 1
                    my_car1.car_change_speed(acceleration)
                    break

                case 39:
                    // right 1
                    my_car1.car_change_direction(1, turn_rate)
                    break

                case 40:
                    // down 1
                    my_car1.car_change_speed(-acceleration)
                    break
            }
        }
        if (my_car2.moving) {
            switch(e.keyCode) {

                case 65:
                    // left 2
                    my_car2.car_change_direction(-1, turn_rate)
                    break

                case 87:
                    // up 2
                    my_car2.car_change_speed(acceleration)
                    break

                case 68:
                    // right 2
                    my_car2.car_change_direction(1, turn_rate)
                    break

                case 83:
                    // down 2
                    my_car2.car_change_speed(-acceleration)
                    break
            }
        }
    }

    document.addEventListener('keydown', change)

    cars.forEach(this_car => {
        this_car.update()
    })
    gate.update()
    
    circles.forEach(this_circle => {
        this_circle.update()
    });

    oils.forEach(this_oil => {
        this_oil.update()
    })
    

    function waitTime(time) {
        return new Promise(resolve => {
            setTimeout(resolve, time);
        });
    }

    let updateCar = function() {
        if (game) {
            
            requestAnimationFrame(updateCar)
            context.clearRect(0,0,canvas.width, canvas.height)
            drawBackground()

            cars.forEach(this_car => {
                this_car.crash = false
                this_car.spinning = false
                this_car.update(context)
            })

            circles.forEach(this_circle => {
                this_circle.update()
            })

            oils.forEach(this_oil => {
                this_oil.update()
            })

            gate.draw(context)
            
            
            cars.forEach(this_car => {
                

                circles.forEach(this_circle => {
                    if (getDistance(this_car.xpos, this_car.ypos, this_circle.xpos, this_circle.ypos) < (this_circle.radius + this_car.radius)) {
                        this_car.crash = true
                    }
                }) 

                oils.forEach(this_oil => {
                    if (this_oil.active) {
                        if (getDistance(this_car.xpos, this_car.ypos, this_oil.xpos, this_oil.ypos) < (this_oil.radius + this_car.radius)) {
                            this_car.spinning = true
                            this_oil.active = false
                            this_oil.respawnTime = this_oil.savedTime
                        }
                    }
                    else {
                        if (this_oil.respawnTime <= 0) {
                            console.log("Oil reactivating")
                            this_oil.active = true
                        }
                        else {
                            this_oil.respawnTime -= 1
                        }
                    }
                }) 

                if (this_car.crash) {
                    this_car.color = "red"
                    this_car.crashing()
                }
                else {
                    this_car.color = this_car.savedColor
                }

                if (this_car.spinning) {
                    this_car.spin()
                }

                this_car.checkGate()

            });
        } 
    }

    updateCar()

})