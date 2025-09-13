#include <SFML/Graphics.hpp>
#include <SFML/Window.hpp>
#include <iostream>
#include <vector>

using namespace std;

// Game constants
const int windowWidth = 800;
const int windowHeight = 600;
const int paddleWidth = 120;
const int paddleHeight = 15;
const int ballRadius = 8;
const int brickWidth = 75;
const int brickHeight = 25;
const int brickPadding = 5;
const int brickOffsetTop = 60;
const int brickOffsetLeft = 35;
const int brickRows = 6;
const int brickCols = 10;

// Game objects
int score = 0;
int lives = 3;

sf::RectangleShape paddle(sf::Vector2f(paddleWidth, paddleHeight));
sf::CircleShape ball(ballRadius);
std::vector<std::vector<sf::RectangleShape>> bricks(brickRows, std::vector<sf::RectangleShape>(brickCols));

// Input handling
bool rightPressed = false, leftPressed = false;
sf::Vector2i mousePosition(0, 0);

// Ball and Paddle movements
float ballDx = 5.f, ballDy = -5.f;
float paddleSpeed = 8.f;

// Function to reset ball position
void resetBall() {
    ball.setPosition(windowWidth / 2.f, windowHeight - 50.f);
    ballDx = 5.f * (rand() % 2 == 0 ? 1 : -1);
    ballDy = -5.f;
}

// Function to initialize bricks
void initBricks() {
    for (int r = 0; r < brickRows; ++r) {
        for (int c = 0; c < brickCols; ++c) {
            bricks[r][c].setSize(sf::Vector2f(brickWidth, brickHeight));
            bricks[r][c].setFillColor(sf::Color(rand() % 256, rand() % 256, rand() % 256));
            bricks[r][c].setPosition(c * (brickWidth + brickPadding) + brickOffsetLeft, r * (brickHeight + brickPadding) + brickOffsetTop);
        }
    }
}

// Function to handle the drawing of the game
void drawGame(sf::RenderWindow &window) {
    // Clear the window
    window.clear(sf::Color::Black);

    // Draw bricks
    for (int r = 0; r < brickRows; ++r) {
        for (int c = 0; c < brickCols; ++c) {
            if (bricks[r][c].getSize().x != 0) {
                window.draw(bricks[r][c]);
            }
        }
    }

    // Draw paddle
    window.draw(paddle);

    // Draw ball
    window.draw(ball);

    // Display the current score and lives
    sf::Font font;
    if (!font.loadFromFile("arial.ttf")) {
        std::cerr << "Error loading font" << std::endl;
    }

    sf::Text scoreText("Score: " + std::to_string(score), font, 20);
    scoreText.setFillColor(sf::Color::White);
    scoreText.setPosition(10.f, 10.f);
    window.draw(scoreText);

    sf::Text livesText("Lives: " + std::to_string(lives), font, 20);
    livesText.setFillColor(sf::Color::White);
    livesText.setPosition(windowWidth - 100.f, 10.f);
    window.draw(livesText);

    window.display();
}

// Function to handle collisions with bricks
void collisionDetection() {
    for (int r = 0; r < brickRows; ++r) {
        for (int c = 0; c < brickCols; ++c) {
            sf::RectangleShape &brick = bricks[r][c];
            if (brick.getSize().x != 0) {
                if (ball.getGlobalBounds().intersects(brick.getGlobalBounds())) {
                    ballDy = -ballDy;
                    brick.setSize(sf::Vector2f(0, 0)); // Destroy brick
                    score += 10;

                    // Check if all bricks are destroyed
                    if (score == brickRows * brickCols * 10) {
                        std::cout << "You Win!" << std::endl;
                        lives = 0; // End the game
                    }
                }
            }
        }
    }
}

// Function to handle paddle movement
void movePaddle() {
    if (rightPressed && paddle.getPosition().x + paddleWidth < windowWidth) {
        paddle.move(paddleSpeed, 0);
    }
    if (leftPressed && paddle.getPosition().x > 0) {
        paddle.move(-paddleSpeed, 0);
    }
    // Mouse control
    paddle.setPosition(mousePosition.x - paddleWidth / 2, paddle.getPosition().y);
}

// Function to update the ball's position
void moveBall() {
    ball.move(ballDx, ballDy);

    // Ball collision with the left and right walls
    if (ball.getPosition().x <= 0 || ball.getPosition().x + ballRadius * 2 >= windowWidth) {
        ballDx = -ballDx;
    }

    // Ball collision with the top wall
    if (ball.getPosition().y <= 0) {
        ballDy = -ballDy;
    }

    // Ball collision with the paddle
    if (ball.getGlobalBounds().intersects(paddle.getGlobalBounds())) {
        ballDy = -ballDy;
    }

    // Ball falls below the paddle
    if (ball.getPosition().y + ballRadius * 2 > windowHeight) {
        lives--;
        if (lives == 0) {
            std::cout << "Game Over! Final Score: " << score << std::endl;
            exit(0);
        } else {
            resetBall();
        }
    }
}

int main() {
    sf::RenderWindow window(sf::VideoMode(windowWidth, windowHeight), "Brick Breaker Game");

    // Initialize game objects
    resetBall();
    initBricks();

    // Main game loop
    while (window.isOpen()) {
        sf::Event event;
        while (window.pollEvent(event)) {
            if (event.type == sf::Event::Closed) {
                window.close();
            }

            if (event.type == sf::Event::KeyPressed) {
                if (event.key.code == sf::Keyboard::Right) {
                    rightPressed = true;
                }
                if (event.key.code == sf::Keyboard::Left) {
                    leftPressed = true;
                }
            }

            if (event.type == sf::Event::KeyReleased) {
                if (event.key.code == sf::Keyboard::Right) {
                    rightPressed = false;
                }
                if (event.key.code == sf::Keyboard::Left) {
                    leftPressed = false;
                }
            }

            if (event.type == sf::Event::MouseMoved) {
                mousePosition = sf::Mouse::getPosition(window);
            }
        }

        // Game logic
        moveBall();
        movePaddle();
        collisionDetection();

        // Draw everything
        drawGame(window);
    }

    return 0;
}
