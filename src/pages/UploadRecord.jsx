import pb from '@/api/pockethost';
import userUId from '@/api/userUid';
import noImage from '@/assets/noImage.png';
import Spinner from '@/components/Spinner';
import Button from '@/components/button/Button';
import CommentItem from '@/components/comment/Commentitem';
import Headerback from '@/components/header/Headerback';
import SubmitInput from '@/components/input/SubmitInput';
import Nav from '@/components/nav/Nav';
import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';

function UploadRecord() {
	const { dataId } = useParams();
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [comment, setComment] = useState([]);
	const [commentInput, setCommentInput] = useState('');
	const [isLoading, setIsLoading] = useState(false);
	const [escapeList, setEscapeList] = useState([]);
	const [likeUpdate, setLikeUpdate] = useState(0);

	// 뒤로가기
	const handleBack = () => {
		updateLikeInPb();
		navigate(-1);
	};

	//게시글 삭제 기능
	const handleDeleteRecord = async () => {
		const deleteConfirm = confirm('정말로 삭제하시겠습니까?');

		//user에 escapeList에 연결된 값 삭제하기
		// 해당 테마의 아이디값을 제외한 배열로 업데이트하기
		const array = escapeList.filter(
			(i) => i !== `${data.expand?.escapeList?.id}`
		);

		const updateEscapeList = { escapeList: array };

		try {
			if (deleteConfirm) {
				await pb.collection('record').delete(`${dataId}`);
				await pb
					.collection('users')
					.update(`${userUId.model.id}`, updateEscapeList);

				toast('삭제되었습니다', {
					icon: '🗑️',
					duration: 2000,
				});
				updateLikeInPb();
				navigate('/theme');
			}
		} catch (err) {
			console.log(`삭제 에러: ${err}`);
		}
	};

	//게시글 수정 기능
	const handleEditRecord = () => {
		try {
			updateLikeInPb();
			navigate(`/theme/edit/${dataId}`);
		} catch (err) {
			console.log(`수정 에러: ${err}`);
		}
	};

	// 댓글 입력하기
	const handleComment = async (e) => {
		setCommentInput(e.target.value);
	};

	// 등록 버튼
	const handleSubmitComment = async (e) => {
		e.preventDefault();

		// 등록할 댓글
		const commentData = {
			content: commentInput,
			author: `${userUId?.model.id}`,
			record: `${dataId}`,
		};

		// 새로고침 후 다시 받아온 댓글 데이터
		const againCommentData = await pb.collection('comment').getList(1, 200, {
			filter: `record = "${dataId}"`,
			sort: '-created',
			expand: 'author, record',
		});

		try {
			await pb.collection('comment').create(commentData);

			toast('등록되었습니다 :)', {
				icon: '💛',
				duration: 2000,
			});

			setCommentInput('');
			setComment(againCommentData.items);
			updateLikeInPb();
			location.reload();
		} catch (err) {
			console.log(`댓글 등록 에러: ${err}`);
		}
	};

	// 좋아요기능
	const handleLike = () => {
		setLikeUpdate(likeUpdate + 1);

		toast('좋아요 +1', {
			icon: '❤️',
			duration: 800,
		});
	};

	// 좋아요 수 서버 업데이트
	const updateLikeInPb = async () => {
		try {
			const likeData = {
				like: likeUpdate,
			};

			await pb.collection('record').update(`${dataId}`, likeData);
		} catch (error) {
			console.error('좋아요 업데이트 실패:', error);
		}
	};

	//데이터 불러오기
	useEffect(() => {
		const handleRecordData = async () => {
			// 기록데이터
			const recordData = await pb.collection('record').getOne(`${dataId}`, {
				expand: 'escapeList, author',
			});

			// 댓글데이터
			const commentData = await pb.collection('comment').getList(1, 200, {
				filter: `record = "${dataId}"`,
				sort: '-created',
				expand: 'author, record',
			});

			try {
				setData(recordData);
				setComment(commentData.items);
				setLikeUpdate(recordData.like);
				setIsLoading(true);
			} catch (err) {
				console.log(`에러 내용: ${err}`);
			}
		};

		handleRecordData();
	}, [dataId]);

	// user에 저장된 escapeList 불러오기
	useEffect(() => {
		const handleUserEscapeList = async () => {
			const userEscapeListData = await pb
				.collection('users')
				.getOne(`${userUId.model.id}`);
			try {
				setEscapeList(userEscapeListData.escapeList);
			} catch (err) {
				console.log(`userEscapeList 불러오기 에러: ${err}`);
			}
		};

		handleUserEscapeList();
	}, []);

	return (
		<div>
			<Helmet>
				<title>
					{`${!data.theme ? data.expand?.escapeList?.theme : data.theme} 기록`}
				</title>
			</Helmet>
			<div className="max-w-[600px] min-w-[320px] bg-ec4 text-ec1 flex flex-col items-center justify-center min-h-[100vh] m-auto relative pt-20 pb-28 text-lg gap-5 px-20 s:px-12">
				<Headerback onClick={handleBack}>
					{!isLoading
						? '로딩중'
						: !data.theme
						? data.expand?.escapeList?.theme
						: data.theme}
				</Headerback>
				{!isLoading && (
					<div className="absolute top-1/2 -translate-y-1/2">
						<Spinner />
					</div>
				)}
				{isLoading && data && (
					<>
						<section className="flex flex-row-reverse items-center gap-4 w-full">
							<div className="flex flex-col gap-3 s:gap-1 whitespace-nowrap flex-1">
								<h3 className="text-2xl font-semibold">
									{!data.store ? data.expand?.escapeList?.store : data.store}
									<span className="ml-3 s:ml-2">
										{data.point
											? `${data.expand?.escapeList.point}점`
											: data.point}
									</span>
								</h3>
								<div className="flex justify-between">
									<p
										className={`flex max-w-fit whitespace-nowrap overflow-hidden text-ellipsis ${
											data.expand?.author?.nickName ? '' : 'text-gray'
										}`}
									>
										{data.expand?.author?.record.length < 6 &&
										data.expand?.author?.record.length > 0
											? `🥚${data.expand?.author?.nickName}`
											: data.expand?.author?.record.length > 5 &&
											  data.expand?.author?.record.length < 11
											? `🐤${data.expand?.author?.nickName}`
											: data.expand?.author?.record.length > 10
											? `🐔${data.expand?.author?.nickName}`
											: `탈퇴회원`}
									</p>
									<span>
										{!data.date ? data.expand?.escapeList.created : data.date}
									</span>
								</div>
							</div>
							<div className="w-20 h-20 s:w-14 s:h-14">
								<img
									className="w-full h-full rounded-full"
									src={
										data.expand?.author?.avatar
											? `https://refresh.pockethost.io/api/files/${data.expand?.author?.collectionId}/${data.expand?.author?.id}/${data.expand?.author?.avatar}`
											: `${noImage}`
									}
									alt={data.expand?.author?.nickName}
									aria-hidden
								/>
							</div>
						</section>
						<img
							className="w-[50%]"
							src={
								data.image
									? `https://refresh.pockethost.io/api/files/${data.collectionId}/${data.id}/${data.image}`
									: data.expand?.escapeList?.image || noImage
							}
							alt={data.expand?.escapeList?.theme}
						/>
						<section className="w-full py-2">
							<ul className="flex justify-between pb-4 font-semibold">
								<li>
									⭐
									{!data.grade && data.grade !== 0
										? data.expand?.escapeList.grade
										: data.grade}
								</li>
								<li>
									{!data.hour ? '0' : data.hour}
									<span className="px-2">:</span>
									<span className="pr-2">
										{!data.minute ? '00' : data.minute}
									</span>
									LEFT
								</li>
								<li>
									<button
										type="button"
										onClick={handleLike}
										className="bg-heartlike bg-no-repeat w-fit pl-7 bg-[left_top_0.3rem]"
									>
										좋아요 {likeUpdate}
									</button>
								</li>
							</ul>
							<div className="min-h-[160px] w-full bg-opacity border-2 p-4 rounded-lg">
								{data.content}
							</div>
						</section>
						{data.expand?.author?.id === `${userUId?.model.id}` && (
							<section className="w-full flex justify-between pb-3">
								<Button
									bg="bg-ec1"
									text="text-ec4"
									onClick={handleDeleteRecord}
								>
									삭제
								</Button>
								<Button bg="bg-ec1" text="text-ec4" onClick={handleEditRecord}>
									수정
								</Button>
							</section>
						)}
						<div className="w-full pt-3 border-t-2">
							<SubmitInput
								placeholder="댓글을 입력해주세요 ☺️"
								value={commentInput}
								onChange={handleComment}
								onSubmit={handleSubmitComment}
								text="text-ec4 my-4 px-0"
							>
								등록
							</SubmitInput>

							<ul className="flex flex-col gap-4 text-lg w-full">
								{isLoading &&
									comment &&
									comment.map((item) => {
										// 댓글 삭제하기
										const handleDeleteComment = async () => {
											const result = confirm('댓글을 삭제하시겠습니까?');

											if (result) {
												await pb.collection('comment').delete(`${item.id}`);
												location.reload();
											}
										};

										return (
											<li key={item.id} className="w-full flex gap-3">
												<CommentItem
													src={
														item.expand?.author?.avatar
															? `https://refresh.pockethost.io/api/files/${item.expand?.author?.collectionId}/${item.expand?.author?.id}/${item.expand?.author?.avatar}`
															: `${noImage}`
													}
													alt={item.expand?.author?.nickName}
													nickName={item.expand?.author?.nickName}
													comment={item.content}
													userId={item.expand?.author?.id}
													id={item.id}
													onClick={handleDeleteComment}
												/>
											</li>
										);
									})}
							</ul>
						</div>
					</>
				)}
			</div>
			<Nav />
		</div>
	);
}

export default UploadRecord;
