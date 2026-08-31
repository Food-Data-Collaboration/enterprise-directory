<script lang="ts">
    import { FilterState } from "$lib/models/filter_state.svelte";
    import { ArrowRight, Search, X } from "@lucide/svelte";
    import ButtonCheckbox from "./ui/button_checkbox.svelte";
    import { getDirectoryState } from "$lib/models/state.svelte";
    import { analytics } from "$lib/analytics";

    const userState = getDirectoryState();

    let filters: FilterState = new FilterState();
    let productCategories: { name: string; value: string }[] = [
        { name: "Fruit & Veg", value: "1" },
        { name: "Meat", value: "2" },
    ];

    let producerCertifications: { name: string; value: string }[] = [
        { name: "Soil Association Organic", value: "1" },
        { name: "OF&G Certified Organic", value: "2" },
        { name: "Community Supported Agriculture", value: "3" },
        { name: "1Soil Association Organic", value: "11" },
        { name: "1OF&G Certified Organic", value: "12" },
        { name: "1Community Supported Agriculture", value: "13" },
        { name: "2Soil Association Organic", value: "21" },
        { name: "2OF&G Certified Organic", value: "22" },
        { name: "2Community Supported Agriculture", value: "23" },
    ];

    function clearFilters() {
        filters.reset();
        analytics.track("filters_cleared");
    }
</script>

<div id="filters">
    <header>
        <div id="head-title">
            <button
                id="close-filters"
                class="btn"
                onclick={() => (userState.showFilters = !userState.showFilters)}
            >
                <X />
            </button>
            <h2>Filter</h2>
            <button id="clear-filters" class="btn" onclick={clearFilters}>
                Clear all
            </button>
        </div>
        <div id="head-search">
            <Search size="24" />
            <input
                type="text"
                placeholder="Find a Landwordker's Alliance producer"
            />
        </div>
    </header>

    <div id="filter-grid">
        <details id="postcode" name="filter-group">
            <summary>
                <h3>Location</h3>
                <span><ArrowRight /></span>
            </summary>
            <div>
                <input type="text" bind:value={filters.postcode} />
                <label for="delivery">
                    <input
                        type="checkbox"
                        id="delivery"
                        name="delivery"
                        bind:checked={filters.delivery}
                    />
                    Home delivery
                </label>
                <label for="collection">
                    <input
                        type="checkbox"
                        id="collection"
                        name="collection"
                        bind:checked={filters.collection}
                    />
                    Local collection
                </label>
                <div>
                    <div>Within <b>{filters.radius} miles</b></div>
                    <input
                        type="range"
                        id="radius"
                        name="radius"
                        min="1"
                        max="50"
                        bind:value={filters.radius}
                    />
                </div>
            </div>
        </details>
        <details id="categories" name="filter-group2">
            <summary>
                <h3>Products</h3>
                <span><ArrowRight /></span>
            </summary>
            <div class="toggles">
                {#each productCategories as category (category.name)}
                    <ButtonCheckbox
                        id={category.name}
                        name="product-category"
                        value={category.value}
                        label={category.name}
                        binding={filters.categories}
                    />
                {/each}
            </div>
        </details>
        <details id="certifications" name="filter-group3">
            <summary>
                <h3>Certification</h3>
                <span><ArrowRight /></span>
            </summary>
            <div>
                {#each producerCertifications as certifications (certifications.name)}
                    <label for={certifications.name}>
                        <input
                            type="checkbox"
                            id={certifications.name}
                            name="certifications"
                            value={certifications.value}
                            bind:group={filters.certifications}
                        />
                        {certifications.name}
                    </label>
                {/each}
            </div>
        </details>
    </div>
</div>

<style lang="scss">
    #filters {
        z-index: 10;
        display: flex;
        flex-grow: 1;
        flex-direction: column;
        gap: $gap-small;
        overflow: auto;
        padding: 24px;
        width: calc($sidebar-width-large + $gap);
        background-color: $white;
        color: $black;
        border-radius: $radius-small;
        box-shadow: $drop-shadow;

        @include from($breakpoint-small) {
            padding: 24px;
        }

        #filter-grid {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: auto auto;
        }
    }

    details {
        display: flex;
        flex-direction: column;
        border-bottom: 1px solid #cac4d0;
        overflow: hidden;
        padding: $gap;
        gap: 0;

        &::details-content {
            transition:
                height 0.3s ease,
                opacity 0.3s ease;
            height: 0;
            opacity: 0;
        }

        div:not(.toggles) {
            display: flex;
            flex-direction: column;
        }

        h3 {
            font-weight: 400;
        }

        summary {
            font-weight: bold;
            cursor: pointer;
            list-style: none;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        &[open] {
            gap: $gap-xsmall;

            &::details-content {
                height: auto;
                opacity: 1;
            }

            summary span {
                transform: rotate(90deg);
            }
        }
    }

    button {
        color: $black;
        background-color: $transparent;
        border: none;

        &#clear-filters {
            text-decoration: underline;
        }
    }

    header {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: $gap-xsmall;

        #head-title {
            display: inline-flex;
            flex-direction: row;
            justify-content: space-between;
        }

        #head-search {
            position: relative;
            grid-area: search;
            display: inline-flex;
            flex-direction: row;
            flex: 1;
            align-items: center;
            max-width: 768px;
            padding: $gap;
            gap: $gap-xsmall;
            background-color: $white;
            border-radius: $radius-full;
            box-shadow: $drop-shadow;
            transition: box-shadow 200ms ease-in;

            &:has(input[type="text"]:focus-visible) {
                outline: 2px solid $secondary;
                box-shadow: $cast-shadow;
            }

            &:hover {
                box-shadow: $cast-shadow;
            }

            input[type="text"] {
                flex: 1;
                min-width: 50px;
                line-height: $text-body;
                border: none;
                background-color: $white;

                &::placeholder {
                    color: $placeholder-grey;
                }

                &:focus-visible {
                    outline: none;
                }
            }
        }
    }

    label {
        user-select: none;
    }
</style>
