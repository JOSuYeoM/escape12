import { arrayOf, shape, number, string } from 'prop-types';
import Comment from '@/components/comment/Comment';

CommentList.propTypes = {
	comments: arrayOf(
		shape({
			id: number,
			author: string,
			content: string,
		})
	).isRequired,
};

function CommentList({ comments }) {
	return (
		<div className="s:min-w-[290px] min-w-[320px]">
			{comments.map((comment) => (
				<Comment
					key={comment.id}
					author={comment.author}
					content={comment.content}
				/>
			))}
		</div>
	);
}

export default CommentList;
