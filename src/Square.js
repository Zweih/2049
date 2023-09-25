import React, {Fragment} from 'react';

const Square = ({number, isNew, isMove, dir, merged}) => {
	const getHexColor = (number) => {
    return "#"+(((number+1)*1222060000)>>>0).toString(16).slice(-6);
	};

	return (
		<Fragment>
			{
				number === 0 ?
					<div className="square" />
				:
					<div
						className={`square filled ${merged ? "merged" : ""} ${isMove ? "move" : ""} ${dir}`}
						id={isNew ? "new" : "old"}
						style={{backgroundColor: getHexColor(number)}}
					>
     				<p>{number}</p>
					</div>
			}
		</Fragment>
	);
}

Square.defaultProps = {
	number: 0,
	isNew: false,
}
 
export default Square;