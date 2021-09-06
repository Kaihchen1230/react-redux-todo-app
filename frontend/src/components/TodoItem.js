import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleCompleteAsync, deleteTodoAsync } from '../redux/todoSlice';

const TodoItem = ({ id, title, completed, message }) => {
	const dispatch = useDispatch();
	const handleCheckboxClick = () => {
		dispatch(toggleCompleteAsync({ id, completed: !completed }));
	};

	const handleDeleteClick = () => {
		dispatch(deleteTodoAsync({ id }));
	};

	let text = null;

	if (message !== '') {
		text = <span style={{ color: 'red' }}>({message})</span>;
	}

	return (
		<li className={`list-group-item ${completed && 'list-group-item-success'}`}>
			<div className='d-flex justify-content-between'>
				<span className='d-flex align-items-center'>
					<input
						type='checkbox'
						className='mr-3'
						defaultChecked={completed}
						onClick={handleCheckboxClick}
					></input>
					<p>
						{title}
						{text}
					</p>
				</span>
				<button onClick={handleDeleteClick} className='btn btn-danger'>
					Delete
				</button>
			</div>
		</li>
	);
};

export default TodoItem;
