import React, { useCallback, useState } from "react";
import "./PostList.css";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import PersonalItem from "./PersonalItem";
import OtherPersonalItem from "./OtherPersonalItem";
import ChallengeItem from "./ChallengeItem";

import classNames from "classnames/bind";
const cx = classNames.bind();

function PostList({ type, handleSelectAlien }) {
  const { aliens_list, userId } = useSelector(({ room, user }) => ({
    aliens_list: room.aliens,
    userId: user.user,
  }));

  let params = useParams();

  const [category, setCategory] = useState(false);
  const [sort, setSort] = useState("a");
  const [isMenuOn, setIsMenuOn] = useState(false);

  // functions for sort
  const recentCreate = useCallback((a, b) => {
    return (
      new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
    );
  }, []);
  const leastRecentCreate = (a, b) => {
    return (
      new Date(a.created_date).getTime() - new Date(b.created_date).getTime()
    );
  };
  const mostCommit = (a, b) => {
    return b.accumulated_count - a.accumulated_count;
  };
  const leastCommit = (a, b) => {
    return a.accumulated_count - b.accumulated_count;
  };

  const sortClick = (e) => {
    setSort(e.target.value);
    setIsMenuOn(false);
  };

  return (
    <div className="PostListBlock">
      <ToggleBtn isMenuOn={isMenuOn} setIsMenuOn={setIsMenuOn} />
      {isMenuOn ? (
        <div className="dropContent">
          <option value="a" onClick={sortClick}>
            추가된 날짜 (최신 순)
          </option>
          <option value="b" onClick={sortClick}>
            추가된 날짜 (오래된 순)
          </option>
          <option value="c" onClick={sortClick}>
            커밋 횟수(가장 많은 순)
          </option>
          <option value="d" onClick={sortClick}>
            커밋 횟수(가장 낮은 순)
          </option>
        </div>
      ) : null}
      {type === "personal" && (
        <ul>
          <span
            className={category === false ? "selected" : null}
            onClick={() => setCategory((category) => !category)}
          >
            ∘ 진행중
          </span>
          <span
            className={category === true ? "selected" : null}
            onClick={() => setCategory((category) => !category)}
          >
            ∘ 졸업
          </span>
        </ul>
      )}
      {type === 'challenge' && aliens_list.length > 0 &&
        <h1 className='challengeName'>{aliens_list[0].challenge_name}</h1>}

      {aliens_list
        .sort((a, b) => {
          if (sort === "a") return recentCreate(a, b);
          else if (sort === "b") return leastRecentCreate(a, b);
          else if (sort === "c") return mostCommit(a, b);
          else return leastCommit(a, b);
        })
        .map((alien) =>
          type === "personal" ? (
            Boolean(alien.alien_status) === category ? (
              parseInt(params.userId) === userId.id ? (
                <PersonalItem
                  key={alien.id}
                  alien={alien}
                  userId={userId}
                  handleSelectAlien={handleSelectAlien}
                />
              ) : (
                <OtherPersonalItem
                  key={alien.id}
                  alien={alien}
                  userId={userId}
                  handleSelectAlien={handleSelectAlien}
                />
              )
            ) : null
          ) : (
            type === "challenge" && (
              <ChallengeItem
                key={alien.id}
                alien={alien}
                userId={userId}
                handleSelectAlien={handleSelectAlien}
              />
            )
          )
        )}
    </div>
  );
}
export default PostList;

function ToggleBtn(props) {
  const { isMenuOn, setIsMenuOn } = props;
  return (
    <nav className="toggleBtn">
      <button
        className="text-gray-500 w-10 h-10 relative focus:outline-none bg-transparent"
        onClick={() => setIsMenuOn(!isMenuOn)}
      >
        <div className="block w-5 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <span
            aria-hidden="true"
            className={cx(
              "block absolute h-0.5 w-5 bg-white transform transition duration-500 ease-in-out",
              isMenuOn ? "" : "-translate-y-1.5"
            )}
          ></span>
          <span
            aria-hidden="true"
            className={cx(
              "block absolute h-0.5 w-5 bg-white transform transition duration-500 ease-in-out",
              isMenuOn ? "" : ""
            )}
          ></span>
          <span
            aria-hidden="true"
            className={cx(
              "block absolute h-0.5 w-5 bg-white transform transition duration-500 ease-in-out",
              isMenuOn ? "" : "translate-y-1.5"
            )}
          ></span>
        </div>
      </button>
    </nav>
  );
}
