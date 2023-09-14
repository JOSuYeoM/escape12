import { func, string } from 'prop-types';
import PropTypes from 'prop-types';
import Sup from '../record/Sup';

FormInput.propTypes = {
	type: string,
	name: string,
	bg: string,
	children: PropTypes.oneOfType([
		PropTypes.arrayOf(PropTypes.node),
		PropTypes.node,
	]),
	onChange: func,
	onClick: func,
};

function FormInput({
	children,
	type,
	name,
	bg = 'hidden',
	onChange = null,
	onClick = null,
	...restProps
}) {
	return (
		<>
			<fieldset className="flex gap-5 justify-between text-ec1 relative px-2">
				<label htmlFor={name} className="w-32 s:min-w-fit">
					<Sup>{children}</Sup>
				</label>
				<input
					type={type}
					className="w-[300px] s:w-[90%] bg-opacity border-b-2 border-ec1 focus:outline-none"
					name={name}
					id={name}
					onChange={onChange}
					required
					maxLength={30}
					autoComplete="off"
					{...restProps}
				/>
				<button
					type="button"
					className={`${bg} bg-cover w-5 h-5 absolute right-1 top-0`}
					onClick={onClick}
				/>
			</fieldset>
		</>
	);
}

export default FormInput;
