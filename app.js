document.addEventListener('DOMContentLoaded', () => {

    let canvas = document.getElementById("canvas")
    let best_time_p = document.getElementById("best_time")
    let score_p = document.getElementById("score")
    let score = -1

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
            context.beginPath()
            context.strokeStyle = this.color
            context.lineWidth = 5

            context.arc(this.xpos, this.ypos, this.radius, 0, Math.PI*2, false)
            context.stroke()
            context.closePath()
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

            if (mode == "easy") {
                var startX = canvas.width/2
                var startY = canvas.height/2 + 103

                var endX = canvas.width/2
                var endY = canvas.height - 100
            }
            else {
                var startX = canvas.width/2
                var startY = canvas.height/2 + 75

                var endX = canvas.width/2
                var endY = canvas.height - 75
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
        constructor(xpos, ypos, radius, color, text, speed, image) {
            this.xpos = xpos
            this.ypos = ypos
            this.radius = radius
            this.color = color
            this.text = text
            this.speed = speed

            this.dx = 1 * speed
            this.dy = 1 * speed
            this.angle = Math.PI
            this.image = image
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

    var img = new Image()
    // image source is https://www.rawpixel.com/image/8705143/png-plant-people
    img.src = "car.png"

    let my_car = new Car(canvas.width/2 + 100, 565, 50, "black", "car", 0, img)

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
    
    gate = new Gate("blue")


    function change(e) {
        e.preventDefault()

        let turn_rate = 0.2
        let acceleration = 1
        switch(e.keyCode) {
            case 37:
                // left
                my_car.car_change_direction(-1, turn_rate)
                break

            case 38:
                // up
                my_car.car_change_speed(acceleration)
                break

            case 39:
                // right
                my_car.car_change_direction(1, turn_rate)
                break

            case 40:
                my_car.car_change_speed(-acceleration)
                break

            case 65:
                // left
                my_car.car_change_direction(-1, turn_rate)
                break

            case 87:
                // up
                my_car.car_change_speed(acceleration)
                break

            case 68:
                // right
                my_car.car_change_direction(1, turn_rate)
                break

            case 83:
                my_car.car_change_speed(-acceleration)
                break
        }
    }

    document.addEventListener('keydown', change)

    my_car.draw(context)
    gate.draw(context)
    
    // circles.forEach(this_circle => {
    //     this_circle.update()
    // }); 
    
    

    var touching_gate = false
    var crash = false

    var startTime = 0

    let updateCar = function() {
        if (game) {
            
            requestAnimationFrame(updateCar)
            context.clearRect(0,0,canvas.width, canvas.height)
            drawBackground()
            my_car.update()
            gate.draw(context)
            
            
            circles.forEach(this_circle => {
                //this_circle.update()
                if (getDistance(my_car.xpos, my_car.ypos, this_circle.xpos, this_circle.ypos) < (this_circle.radius + my_car.radius)) {
                    crash = true
                }
            });

            if (crash) {
                my_car.color = "red"
                game = false
            }
            else {
                my_car.color = "black"
            }

            if ((canvas.width/2 -3 < my_car.xpos) && (my_car.xpos < canvas.width/2 +3) && (canvas.height/2+100 < my_car.ypos) && (my_car.ypos < canvas.height-100)) {
                if (!touching_gate) {
                    score += 1
                    score_p.innerHTML = score

                    if (score > 0) {
                        var elapsed_time = performance.now()-startTime

                        var seconds = Math.floor(elapsed_time / 1000);
                        var milliseconds = elapsed_time % 1000;
                        milliseconds = milliseconds.toFixed(2)
                        best_time_p.innerHTML = seconds + ' s ' + milliseconds + ' ms '
                        startTime = performance.now()
                    }
                    else {
                        best_time_p.innerHTML = "Complete a full lap"
                    }
                }
                touching_gate = true
            }
            else {
                touching_gate = false
            }
        }
        
    }


    updateCar()

})