import React from 'react';
import styled, { createGlobalStyle } from 'styled-components'

// https://tsukulog.net/2021/09/20/react-wheel-number-picker/
// 【React】時間や生年月日などをダイヤル南京錠のように回転させながら選択するピッカーを作る

const StyledWheelPicker = styled.div`
	display: grid;
	grid-template-rows: repeat(2, auto);
  grid-template-columns: repeat(auto-fill, auto);	
	place-items: center; 
	align-items: center;
	justify-content: center;
	gap: .5em;

	& .delimiter {
		font-size: .75em;

		&-1 {
			grid-column: 2 / 3;
		}
		&-2 {
			grid-column: 4 / 5;
		}
		&-3 {
			grid-column: 6 / 7;
		}
	}

	& .dial {
		&-display {
			border-top: .1em solid #333;
			border-bottom: .1em solid #333;
			height: 1em;
			overflow-y: hidden;
			padding: .4em;

			&-1 {
				grid-column: 1 / 2;
			}
			&-2 {
				grid-column: 3 / 4;
			}
			&-3 {
				grid-column: 5 / 6;
			}
		}
		&-title {
			font-size: .6em;

			&-1 {
				grid-column: 1 / 2;
			}
			&-2 {
				grid-column: 3 / 4;
			}
			&-3 {
				grid-column: 5 / 6;
			}
		}
		&-nums {
			cursor: pointer;
			position: relative;
			top: 0em;
			transition: .2s linear;
			user-select: none;
		}

		&-num {
			height: 1em;
		}
	}
`

const WheelPicker = ({ className, dials, delimiters }) => {

  // dialsオブジェクトを配列に変換
	const dialNames = Object.keys(dials)

	return (
		<StyledWheelPicker className={className}>
			{
				dialNames.map((name, i, arr) => (
					<div className={`dial-title dial-title-${i + 1}`} key={i}>
						{name}
					</div>
				))
			}
			{
				dialNames.map((name, i, arr) => (
					<div key={i}>
						<div className={`dial-display dial-display-${i + 1}`}>
							<div
								className={`dial-nums dial-nums-${i}`}
								key={i}
								id={name}
							>
								{
									dials[name].map((num, i, array) => (
										<div className="dial-num" key={i}>{String(num).padStart(2, "0")}</div>
									))
								}
							</div>
						</div>
						{delimiters[i] && <div className={`delimiter delimiter-${i + 1}`}>{delimiters[i]}</div>}
					</div>
				))
			}	
		</StyledWheelPicker>
	)
}
//			<Spacer size=".5em" horizontal={true} />

export default WheelPicker;
