import React, { Component } from 'react';
import Square from './Square';

const gridSize = 4;

const paths = {
	left: {
		iStart: 0,
		jStart: 1,
		interval: 1,
		isVert: false, 
	},
	right: {
		iStart: gridSize - 1,
		jStart: gridSize - 2,
		interval: -1,
		isVert: false, 
	},
	up: {
		iStart: 1,
		jStart: 0,
		interval: 1,
		isVert: true,
	},
	down: {
		iStart: gridSize - 2,
		jStart: gridSize - 1,
		interval: -1,
		isVert: true,
	},
};

class Game extends Component {
	constructor(props) {
		super(props);

		this.state = { 
			grid: this.createGrid(),
			new: [-1, -1],
			score: 4,
			isGameOver: false,
			isMoving: false,
			gameLog: [],
		};

		if (localStorage.getItem("gameLogs") === null) {
      localStorage.setItem("gameLogs", JSON.stringify([]));
    }
	}

	createGrid = () => {
		const firstSquare = [this.randomNoRepeat(), this.randomNoRepeat()];
		const secondSquareX = this.randomNoRepeat();
		const secondSquare = [
			secondSquareX,
			this.randomNoRepeat(secondSquareX === firstSquare[0] ? firstSquare[1] : null)
		];

		const grid = [...Array(gridSize)].map(() =>
			new Array(gridSize).fill().map(() => ({value: 0, merged: false, move: false, dir: ""}))
		);
		
		const squares = [
			[...firstSquare],
			[...secondSquare]
		];

		squares.forEach(square => 
			grid[square[0]][square[1]] = {value: 2, merged: false, move: false, dir: ""}
		);

		return grid;
	};

	restartGame = () => {
		this.setState({
			grid: this.createGrid(),
			new: [-1, -1],
			score: 4,
			moving: false,
			isGameOver: false,
			gameLog: [],
		});
	};

	randomNoRepeat = (exclude = null) => {
		const rand = Math.floor(Math.random() * 4);
		return exclude !== null && rand === exclude ? (rand + 1) % gridSize : rand;
	};

	renderGrid = () => this.state.grid.map((row, rowIdx) => (
		<div key={rowIdx} className="row">
			{row.map((square, colIdx) => (
				<Square 
					key={`${rowIdx}_${colIdx}`} 
					number={square.value}
					oldNumber={square.oldValue}
					isNew={this.state.new[0] === rowIdx && this.state.new[1] === colIdx}
					isMove={square.move}
					merged={square.merged}
					dir={square.dir}
				/>
			))}
		</div>
	));

	newSquare = () => {
		const grid = [...this.state.grid];

		grid.forEach(row => row.forEach(square => {
			square.merged = false;
			square.dir = "";
			square.move = 0;
		}));

		const freeSpots = grid.flat().reduce((a, e, i) => (e.value === 0) ? a.concat(i) : a, []);

		if (freeSpots.length !== 0) {
			const pos = freeSpots[Math.floor(Math.random() * freeSpots.length)];
			const spot = [Math.floor(pos / 4), pos % 4];
			grid[spot[0]][spot[1]].value = 2;

			this.setState({
				grid,
				new: spot,
				score: this.state.score + 2,
				moving: false,
			});
		} else {
			this.setState({
				isGameOver: true
			}, () => {
        localStorage.setItem(
					"gameLogs",
					JSON.stringify(
						[...JSON.parse(localStorage.getItem("gameLogs")), this.state.gameLog]
					)
				);
      })
		}
	};

	move = (dir) => {
		this.setState({moving: true});
		const grid = [...this.state.grid];
		const {iStart, jStart, interval, isVert} = paths[dir];

		for (let i = iStart; i < gridSize && i >= 0; i += interval) {
			for (let j = jStart; j < gridSize && j >= 0; j += interval) {
				if (grid[i][j].value !== 0) {
					let pivot = isVert ? i : j;
					for (let k = pivot - interval; k < gridSize && k >= 0; k -= interval) {
						let current, next;

						if (isVert) {
							current = grid[pivot][j];
							next = grid[k][j];
						} else {
							current = grid[i][pivot];
							next = grid[i][k];
						}

						if (!next.merged && !current.merged && (next.value === 0 ||next.value === current.value)) {
							if (next.value === current.value) {
								next.merged = true;
							}

							next.value += current.value;
							next.move = true;
							next.dir = dir;
							current.value = 0;

							this.setState({grid});

							pivot = k;
						} else {
							break;
						}
					} 
				}
			}
		}

		this.setState({
			grid,
      gameLog: [...this.state.gameLog, {
        move: dir,
        boardState: grid.flat().map(el => el.value),
        score: this.state.score + 2,
      }],
		}, () => {
			setTimeout(this.newSquare, 110);
		});
	};

	handleKeyDown = (e) => {
		if (!this.state.isGameOver && !this.state.moving) {
			switch(e.keyCode) {
				case 65:
				case 37:
					this.move('left');
					break;
				case 87:
				case 38:
					this.move('up');
					break;
				case 68:
				case 39:
					this.move('right');
					break;
				case 83:
				case 40:
					this.move('down');
					break;
				default:
			}
		}
	};

  render() {
    return (
			<div
				tabIndex="0"
				onKeyDown={(e) => this.handleKeyDown(e)}
				className="wrapper"
			>
				<div className="sideboard">
					<p className="score">Score: {this.state.score}</p>
					<div className="arrows">	
						<div className="top-arrow">
							<div onClick={() => this.move("up")} className="dir">
								↑ W
							</div>
						</div>
						<div className="bottom-arrows">
							<div onClick={() => this.move("left")} className="dir">← A</div>
							<div onClick={() => this.move("down")} className="dir">↓ S</div>
							<div onClick={() => this.move("right")} className="dir">→ D</div>
						</div>
					</div>
					<button onClick={this.restartGame}>Restart</button>
					<p className="gameover">{this.state.isGameOver ? "GAME OVER" : ""}</p>
				</div>
				<div className="board">
					{this.renderGrid()}
				</div>
			</div>
    );
  }
}

Game.defaultProps = {
	restart: false
};

export default Game;
