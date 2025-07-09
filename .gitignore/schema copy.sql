-- ========================
-- TABLES & CONSTRAINTS
-- ========================

CREATE TABLE public.users (
    user_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    username character varying(100) NOT NULL UNIQUE,
    email character varying(100) NOT NULL UNIQUE,
    password_hash character varying(255) NOT NULL,
    is_admin boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    last_login timestamp without time zone,
    failed_login_attempts integer DEFAULT 0,
    account_locked boolean DEFAULT false
);

CREATE TABLE public.admin_log (
    log_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    admin_id integer NOT NULL,
    action_text text NOT NULL,
    log_time timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_admin_log_admin FOREIGN KEY (admin_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.person (
    person_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(255) NOT NULL,
    birthdate date,
    bio text,
    profile_img_url character varying(500),
    popularity double precision
);

CREATE TABLE public.genre (
    genre_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name character varying(100) NOT NULL UNIQUE
);

CREATE TABLE public.movie (
    movie_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title character varying(255) NOT NULL,
    release_date date,
    duration integer,
    description text,
    rating double precision CHECK (rating >= 0 AND rating <= 10),
    vote_count integer DEFAULT 0,
    poster_url character varying(500),
    trailer_url character varying(500)
);

CREATE TABLE public.series (
    series_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    title character varying(255) NOT NULL,
    start_date date,
    end_date date,
    description text,
    rating double precision CHECK (rating >= 0 AND rating <= 10),
    vote_count integer DEFAULT 0,
    poster_url character varying(500),
    trailer_url text
);

CREATE TABLE public.season (
    season_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    series_id integer NOT NULL,
    season_number integer NOT NULL,
    release_date date,
    average_rating double precision,
    trailer_url text,
    description text,
    CONSTRAINT fk_season_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE
);

CREATE TABLE public.episode (
    episode_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    season_id integer NOT NULL,
    episode_number integer NOT NULL,
    title text NOT NULL,
    air_date date,
    duration integer,
    description text,
    CONSTRAINT fk_episode_season FOREIGN KEY (season_id) REFERENCES public.season (season_id) ON DELETE CASCADE
);

CREATE TABLE public.movie_genre (
    movie_id integer NOT NULL,
    genre_id integer NOT NULL,
    PRIMARY KEY (movie_id, genre_id),
    CONSTRAINT fk_moviegenre_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_moviegenre_genre FOREIGN KEY (genre_id) REFERENCES public.genre (genre_id) ON DELETE CASCADE
);

CREATE TABLE public.series_genre (
    series_id integer NOT NULL,
    genre_id integer NOT NULL,
    PRIMARY KEY (series_id, genre_id),
    CONSTRAINT fk_seriesgenre_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE,
    CONSTRAINT fk_seriesgenre_genre FOREIGN KEY (genre_id) REFERENCES public.genre (genre_id) ON DELETE CASCADE
);

CREATE TABLE public.movie_cast (
    movie_id integer NOT NULL,
    person_id integer NOT NULL,
    character_name character varying(255) NOT NULL,
    PRIMARY KEY (movie_id, person_id),
    CONSTRAINT fk_moviecast_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_moviecast_person FOREIGN KEY (person_id) REFERENCES public.person (person_id) ON DELETE CASCADE
);

CREATE TABLE public.movie_crew (
    movie_id integer NOT NULL,
    person_id integer NOT NULL,
    role character varying(100) NOT NULL,
    PRIMARY KEY (movie_id, person_id, role),
    CONSTRAINT fk_moviecrew_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_moviecrew_person FOREIGN KEY (person_id) REFERENCES public.person (person_id) ON DELETE CASCADE
);

CREATE TABLE public.series_cast (
    series_id integer NOT NULL,
    person_id integer NOT NULL,
    character_name character varying(255) NOT NULL,
    PRIMARY KEY (series_id, person_id),
    CONSTRAINT fk_seriescast_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE,
    CONSTRAINT fk_seriescast_person FOREIGN KEY (person_id) REFERENCES public.person (person_id) ON DELETE CASCADE
);

CREATE TABLE public.series_crew (
    series_id integer NOT NULL,
    person_id integer NOT NULL,
    role character varying(100) NOT NULL,
    PRIMARY KEY (series_id, person_id, role),
    CONSTRAINT fk_seriescrew_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE,
    CONSTRAINT fk_seriescrew_person FOREIGN KEY (person_id) REFERENCES public.person (person_id) ON DELETE CASCADE
);

CREATE TABLE public.movie_award (
    award_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    movie_id integer,
    award_name character varying(255) NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    CONSTRAINT fk_movieaward_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE SET NULL
);

CREATE TABLE public.series_award (
    award_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    series_id integer,
    award_name character varying(255) NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    CONSTRAINT fk_seriesaward_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE SET NULL
);

CREATE TABLE public.awards (
    award_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    person_id integer NOT NULL,
    award_name character varying(255) NOT NULL,
    year integer NOT NULL,
    category character varying(255),
    CONSTRAINT fk_awards_person FOREIGN KEY (person_id) REFERENCES public.person (person_id) ON DELETE CASCADE
);

CREATE TABLE public.post_n_poll (
    post_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    content text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    has_poll boolean DEFAULT false,
    CONSTRAINT fk_post_poll_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.poll_option (
    option_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    post_id integer NOT NULL,
    option_text character varying(255) NOT NULL,
    CONSTRAINT fk_polloption_post FOREIGN KEY (post_id) REFERENCES public.post_n_poll (post_id) ON DELETE CASCADE
);

CREATE TABLE public.vote (
    vote_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    option_id integer NOT NULL,
    voted_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_vote_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_vote_option FOREIGN KEY (option_id) REFERENCES public.poll_option (option_id) ON DELETE CASCADE
);

CREATE TABLE public.similar_users (
    user1_id integer NOT NULL,
    user2_id integer NOT NULL,
    similarity_score numeric(5,4),
    CONSTRAINT similar_users_check CHECK (user1_id <> user2_id),
    PRIMARY KEY (user1_id, user2_id),
    CONSTRAINT fk_similar_users_user1 FOREIGN KEY (user1_id) REFERENCES public.users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_similar_users_user2 FOREIGN KEY (user2_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.user_log (
    log_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    login_time timestamp without time zone NOT NULL,
    logout_time timestamp without time zone,
    ip_address character varying(45),
    CONSTRAINT fk_userlog_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.watchlist (
    watchlist_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_watchlist_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.watchlist_movie (
    watchlist_id integer NOT NULL,
    movie_id integer NOT NULL,
    status character varying(10) NOT NULL CHECK (status IN ('watched', 'to-watch', 'watching')),
    PRIMARY KEY (watchlist_id, movie_id),
    CONSTRAINT fk_watchlistmovie_watchlist FOREIGN KEY (watchlist_id) REFERENCES public.watchlist (watchlist_id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlistmovie_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE
);

CREATE TABLE public.watchlist_series (
    watchlist_id integer NOT NULL,
    series_id integer NOT NULL,
    status character varying(10) NOT NULL CHECK (status IN ('watched', 'to-watch', 'watching')),
    PRIMARY KEY (watchlist_id, series_id),
    CONSTRAINT fk_watchlistseries_watchlist FOREIGN KEY (watchlist_id) REFERENCES public.watchlist (watchlist_id) ON DELETE CASCADE,
    CONSTRAINT fk_watchlistseries_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE
);

CREATE TABLE public.movie_review (
    review_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    movie_id integer NOT NULL,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_moviereview_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_moviereview_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE
);

CREATE TABLE public.series_review (
    review_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id integer NOT NULL,
    series_id integer NOT NULL,
    rating integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_seriesreview_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE,
    CONSTRAINT fk_seriesreview_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE
);

CREATE TABLE public.episode_review (
    review_id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    episode_id integer NOT NULL,
    user_id integer NOT NULL,
    rating integer CHECK (rating BETWEEN 1 AND 5),
    comment text,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT fk_epreview_episode FOREIGN KEY (episode_id) REFERENCES public.episode (episode_id) ON DELETE CASCADE,
    CONSTRAINT fk_epreview_user FOREIGN KEY (user_id) REFERENCES public.users (user_id) ON DELETE CASCADE
);

CREATE TABLE public.recommendation_movie (
    movie_id integer NOT NULL,
    recommended_movie_id integer NOT NULL,
    CONSTRAINT recommendation_movie_check CHECK (movie_id <> recommended_movie_id),
    PRIMARY KEY (movie_id, recommended_movie_id),
    CONSTRAINT fk_recommend_movie FOREIGN KEY (movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommend_recommended_movie FOREIGN KEY (recommended_movie_id) REFERENCES public.movie (movie_id) ON DELETE CASCADE
);

CREATE TABLE public.recommendation_series (
    series_id integer NOT NULL,
    recommended_series_id integer NOT NULL,
    CONSTRAINT recommendation_series_check CHECK (series_id <> recommended_series_id),
    PRIMARY KEY (series_id, recommended_series_id),
    CONSTRAINT fk_recommend_series FOREIGN KEY (series_id) REFERENCES public.series (series_id) ON DELETE CASCADE,
    CONSTRAINT fk_recommend_recommended_series FOREIGN KEY (recommended_series_id) REFERENCES public.series (series_id) ON DELETE CASCADE
);
