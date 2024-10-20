window.addEventListener("load", () => {
  (() => {
    if (typeof MiniSearch === "undefined") return;

    const miniSearch = new MiniSearch({
      fields: ["title", "description", "tags", "type"],
      idField: "id",
      storeFields: [
        "id",
        "title",
        "url",
        "description",
        "type",
        "tags",
        "total_plays",
      ],
      searchOptions: {
        fields: ["title", "tags"],
        prefix: true,
        fuzzy: 0.1,
        boost: { title: 5, tags: 2, description: 1 },
      },
    });

    const $form = document.querySelector(".search__form");
    const $fallback = document.querySelector(".search__form--fallback");
    const $input = document.querySelector(".search__form--input");
    const $results = document.querySelector(".search__results");
    const $loadMoreButton = document.querySelector(".search__load-more");
    const $typeCheckboxes = document.querySelectorAll(
      '.search__form--type input[type="checkbox"]'
    );

    $form.removeAttribute("action");
    $form.removeAttribute("method");
    if ($fallback) $fallback.remove();

    const PAGE_SIZE = 10;
    let currentPage = 1;
    let currentResults = [];
    let total = 0;

    const parseMarkdown = (markdown) =>
      markdown
        ? markdown
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\*(.*?)\*/g, "<em>$1</em>")
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
            .replace(/\n/g, "<br>")
            .replace(/[#*_~`]/g, "")
        : "";

    const truncateDescription = (markdown, maxLength = 150) => {
      const plainText =
        new DOMParser().parseFromString(parseMarkdown(markdown), "text/html")
          .body.textContent || "";
      return plainText.length > maxLength
        ? `${plainText.substring(0, maxLength)}...`
        : plainText;
    };

    const formatArtistTitle = (title, totalPlays) =>
      totalPlays > 0
        ? `${title} <strong class="highlight-text">${totalPlays} plays</strong>`
        : title;

    const renderSearchResults = (results) => {
      const resultHTML = results
        .map(
          ({ title, url, description, type, total_plays }) => `
        <li class="search__results--result">
          <a href="${url}">
            <h3>${
              type === "artist" && total_plays
                ? formatArtistTitle(title, total_plays)
                : title
            }</h3>
          </a>
          <p>${truncateDescription(description)}</p>
        </li>
      `
        )
        .join("");

      $results.innerHTML =
        resultHTML ||
        '<li class="search__results--no-results">No results found.</li>';
      $results.style.display = "block";
    };

    const loadSearchIndex = async (query, types, page) => {
      try {
        const typeQuery = types.join(",");
        const response = await fetch(
          `https://coryd.dev/api/search?q=${query}&type=${typeQuery}&page=${page}&pageSize=${PAGE_SIZE}`
        );
        const { results, total: newTotal } = await response.json();
        total = newTotal;

        const formattedResults = results.map((item) => ({
          ...item,
          id: item.result_id,
        }));
        miniSearch.removeAll();
        miniSearch.addAll(formattedResults);
        return formattedResults;
      } catch (error) {
        console.error("Error fetching search data:", error);
        return [];
      }
    };

    const getSelectedTypes = () =>
      Array.from($typeCheckboxes)
        .filter((cb) => cb.checked)
        .map((cb) => cb.value);

    const updateSearchResults = (results) => {
      if (currentPage === 1) {
        renderSearchResults(results);
      } else {
        appendSearchResults(results);
      }
      $loadMoreButton.style.display =
        currentPage * PAGE_SIZE < total ? "block" : "none";
    };

    const appendSearchResults = (results) => {
      const newResultsHTML = results
        .map(
          ({ title, url, description, type, total_plays }) => `
        <li class="search__results--result">
          <a href="${url}">
            <h3>${
              type === "artist" && total_plays
                ? formatArtistTitle(title, total_plays)
                : title
            }</h3>
          </a>
          <p>${truncateDescription(description)}</p>
        </li>
      `
        )
        .join("");
      $results.insertAdjacentHTML("beforeend", newResultsHTML);
    };

    const handleSearch = async () => {
      const query = $input.value.trim();
      if (!query) {
        renderSearchResults([]);
        $loadMoreButton.style.display = "none";
        return;
      }

      const results = await loadSearchIndex(query, getSelectedTypes(), 1);
      currentResults = results;
      currentPage = 1;
      updateSearchResults(results);
    };

    $input.addEventListener("input", () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(handleSearch, 300);
    });

    $typeCheckboxes.forEach((cb) =>
      cb.addEventListener("change", handleSearch)
    );

    $loadMoreButton.addEventListener("click", async () => {
      currentPage++;
      const nextResults = await loadSearchIndex(
        $input.value.trim(),
        getSelectedTypes(),
        currentPage
      );
      currentResults = [...currentResults, ...nextResults];
      updateSearchResults(nextResults);
    });
  })();
});
