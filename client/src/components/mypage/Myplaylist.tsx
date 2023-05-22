import { useRecoilState, useSetRecoilState } from 'recoil';
import styled from 'styled-components';
import { AiFillHeart } from 'react-icons/ai';
import { BsMusicPlayer, BsPlayCircle, BsPlusSquare } from 'react-icons/bs';
import { CiMenuKebab } from 'react-icons/ci';
import { modalState, myplaylistState, modifyDataState } from 'src/recoil/Atoms';
import { useState, useEffect } from 'react';
import axios from 'axios';

const Myplaylist = () => {
    /* 2023.05.16 마이플레이리스트 메뉴 버튼 클릭시 수정, 삭제 버튼 모달 */
    const [showModal, setShowModal] = useRecoilState<boolean>(modalState);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState<number | null>(null);

    const [currentPage, setCurrentPage] = useState<number>(1); // 현재 페이지
    const [totalPages, setTotalPages] = useState<number>(0); // 전체 페이지 수
    const buttonArray = [];

    const token: string | undefined = window.localStorage.getItem('access_token') || undefined;

    const [myplaylistData, setMyplaylistData] = useRecoilState(myplaylistState);

    /* 2023.05.21 마이플레이리스트 생성 */
    const MyplaylistCreate = () => {
        axios
            .post(
                `http://ec2-52-78-105-114.ap-northeast-2.compute.amazonaws.com:8080/playlists`,
                {
                    title: '플레이리스트',
                    body: '플레이리스트 내용',
                    coverImg: './assets/mypage.png',
                },
                {
                    headers: {
                        Authorization: token,
                    },
                },
            )
            .then((response) => {
                console.log(response);
                setMyplaylistData((prevData) => [...prevData, response.data]);
            })
            .catch((error) => {
                console.error(error);
            });
    };

    /* 2023.05.22 마이플레이리스트 조회 */
    useEffect(() => {
        // 플레이리스트 데이터를 가져오는 함수
        const fetchMyplaylistData = async () => {
            try {
                const response = await axios.get(
                    `http://ec2-52-78-105-114.ap-northeast-2.compute.amazonaws.com:8080/playlists/member-playlist?&page=${currentPage}&size=3`,
                    {
                        headers: {
                            Authorization: token,
                        },
                    },
                );
                setMyplaylistData(response.data.data);
                setTotalPages(response.data.pageInfo.totalPages);
            } catch (error) {
                console.error(error);
            }
        };

        fetchMyplaylistData();
    }, []);

    /* 2023.05.22 마이플레이리스트 삭제 */
    const handleDeletePlaylist = async (playlistId: number) => {
        try {
            await axios.delete(
                `http://ec2-52-78-105-114.ap-northeast-2.compute.amazonaws.com:8080/playlists/${playlistId}`,
                {
                    headers: {
                        Authorization: token,
                    },
                },
            );
            setMyplaylistData((prevData) => prevData.filter((data) => data.playListId !== playlistId));
        } catch (error) {
            console.error(error);
        }
    };

    /** 2023.05.17 전체 페이지 수 만큼 버튼 생성 - 김주비*/
    for (let i = 1; i <= totalPages; i++) {
        buttonArray.push(
            <button
                key={i}
                className={i === currentPage ? 'page-focused' : ''}
                onClick={() => {
                    setCurrentPage(i);
                }}
            >
                {i}
            </button>,
        );
    }
    const handleNextPage = () => {
        setCurrentPage(currentPage + 1);
    };
    const handlePrevPage = () => {
        setCurrentPage(currentPage - 1);
    };

    const setModifyState = useSetRecoilState(modifyDataState);

    const handleModfiyState = () => {
        setModifyState(true);
    };

    return (
        <PlayListContainer>
            <MyplaylistTitle>
                <div className="play-icon">
                    <BsMusicPlayer />
                    <p>MY PLAYLIST</p>
                    <li>
                        <BsPlusSquare onClick={MyplaylistCreate} />
                    </li>
                </div>
                <Pagination>
                    <button disabled={currentPage === 1} onClick={handlePrevPage}>
                        Prev
                    </button>
                    {buttonArray}
                    <button disabled={currentPage === totalPages} onClick={handleNextPage}>
                        Next
                    </button>
                </Pagination>
            </MyplaylistTitle>

            {myplaylistData.map((data) => (
                <PlaylistList key={data.playListId}>
                    <img src={data.coverImg} alt="musicimg" />
                    <li>{data.title}</li>
                    <div className="playlist-vote-icon">
                        <AiFillHeart />
                        {data.likeCount}
                    </div>
                    <div className="playlist-button">
                        <BsPlayCircle />
                    </div>
                    <div
                        className="playlist-menu"
                        onClick={() => {
                            setSelectedPlaylistId(data.playListId);
                            setShowModal(!showModal);
                        }}
                    >
                        <CiMenuKebab />
                        {selectedPlaylistId === data.playListId && showModal && (
                            <ModalContainer>
                                <ModalButtons>
                                    <Button onClick={handleModfiyState}>수정</Button>

                                    <Button onClick={() => handleDeletePlaylist(data.playListId)}>삭제</Button>
                                </ModalButtons>
                            </ModalContainer>
                        )}
                    </div>
                </PlaylistList>
            ))}
        </PlayListContainer>
    );
};

export default Myplaylist;

const PlayListContainer = styled.div`
    width: 400px;
    align-items: center;
    margin: 30px;
    @media screen and (max-width: 1000px) {
        width: 400px;
        margin: 0;
        margin-top: 50px;
        margin-left: 30px;
    }
`;

/* 2023.05.10 Like Music 타이틀 컴포넌트 - 홍혜란 */
const MyplaylistTitle = styled.div`
    display: flex;
    align-items: center;
    flex-direction: row;
    justify-content: space-between;
    margin-bottom: 10px;

    .play-icon {
        display: flex;
        align-items: center;
        font-size: 16px;
        color: rgb(41, 55, 255);
        padding-top: 5px;
    }

    p {
        font-size: 16px;
        color: #ffffff;
        margin-left: 5px;
    }

    li {
        display: flex;
        align-items: center;
        color: white;
        margin-left: 8px;
    }
`;

const PlaylistList = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: rgba(43, 43, 43, 0.8);
    margin-top: 20px;

    img {
        width: 50px;
        height: 50px;
    }

    li {
        font-size: 12px;
        color: white;
    }

    li:nth-child(3) {
        font-size: 10px;
    }

    .playlist-vote-icon {
        font-size: 12px;
        color: rgb(245, 109, 109);
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playlist-button {
        font-size: 16px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .playlist-menu {
        font-size: 16px;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    @media screen and (max-width: 1000px) {
        width: 400px;
        margin: 0;
        margin-top: 20px;
    }
`;

/* 2023.05.16 마이플레이리스트 메뉴 모달 컴포넌트 - 홍혜란 */
const ModalContainer = styled.div`
    position: fixed;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: 30px;
`;

/* 2023.05.16 마이플레이리스트 메뉴 모달 버튼 컴포넌트 - 홍혜란 */
const ModalButtons = styled.div`
    display: flex;
    flex-direction: column;
`;

/* 2023.05.16 마이플레이리스트 메뉴 모달 버튼 컴포넌트 - 홍혜란 */
const Button = styled.button`
    margin-left: 10px;
    background-color: rgba(43, 43, 43, 0.8);
    border: none;
    color: white;
    font-size: 10px;
    padding: 5px;
`;

const Pagination = styled.div`
    button {
        color: #ccc;
        background: none;
        border: 1px solid #5a5a5a;
        border-radius: 3px;
        margin: 0px 3px;
        transition: 0.2s ease-in-out;
        cursor: pointer;
    }
    button:hover {
        color: #ccc;
        border-color: #ccc;
        background: rgba(255, 255, 255, 0.2);
    }

    button:disabled {
        border: 1px solid #5a5a5a;
        color: #5a5a5a;
    }
    button:disabled:hover {
        background: none;
        cursor: default;
    }

    .page-focused {
        color: #ccc;
        border-color: #ccc;
        background: rgba(255, 255, 255, 0.2);
    }
`;
