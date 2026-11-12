<script lang="ts">
    import { ArrowLeft, Globe, Mail, MapPin, Phone } from "@lucide/svelte";
    import { resolve } from "$app/paths";
    import Tag from "./ui/tag.svelte";
    import type { Enterprise } from "$lib/models/enterprise";
    import Panel from "./ui/panel.svelte";
    // import CardProduct from "./ui/card_product.svelte";
    // import { ENABLE_PRODUCTS } from "$app/env/public";

    let {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        enterprise,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        onback,
    }: { enterprise: Enterprise; onback?: () => void } = $props();
</script>

<article>
    {#if onback}
        <button
            type="button"
            style="grid-area: back;"
            aria-label="Back to directory"
            onclick={onback}
        >
            <ArrowLeft size="28" />
        </button>
    {:else}
        <a href={resolve(`/`)} style="grid-area: back;">
            <ArrowLeft size="28" />
        </a>
    {/if}
    <h2 style="grid-area: title;">{enterprise.name}</h2>
    <img style="grid-area: logo;" src={enterprise.logoUrl} alt="logo" />

    <div id="gallery" style="grid-area: photo;">
        {#if enterprise.images[0]}
            <img src={enterprise.images[0]} />
        {:else}
            <div
                style="width:100%; height: 400px; background-color: lightgray;"
            >
                Photos coming soon
            </div>
        {/if}
    </div>

    <div style="grid-area: details">
        <p class="location">
            <MapPin />
            {enterprise.addresses[0]?.formatted}
        </p>
        <div id="tags">
            {#each enterprise.categories as tag (tag)}
                <Tag text={tag} />
            {/each}
        </div>
        <p class="description">{enterprise.description}</p>
        <div>
            <h3>Services</h3>
        </div>
        <div>
            <h3>Certifications</h3>
        </div>
    </div>

    <div id="how-to-buy" style="grid-area: buy">
        <h2>How to buy</h2>
        <section>
            <Panel title="Website" customIcon={Globe}>
                <a href={enterprise.website}>{enterprise.website}</a>
            </Panel>

            <Panel title="Email us" customIcon={Mail}>
                <a href="mailto:{enterprise.email}">{enterprise.email}</a>
            </Panel>

            <Panel title="Phone" customIcon={Phone}>
                <a href="tel:{enterprise.phone}">{enterprise.phone}</a>
            </Panel>
        </section>
    </div>

    <div id="delivery-collection" style="grid-area: deliver">
        <h2>Delivery and Collection</h2>
        <section>
            <Panel title="Website" customIcon={Globe}>
                <a href={enterprise.website}>{enterprise.website}</a>
            </Panel>

            <Panel title="Email us" customIcon={Mail}>
                <a href="mailto:{enterprise.email}">{enterprise.email}</a>
            </Panel>

            <Panel title="Phone" customIcon={Phone}>
                <a href="tel:{enterprise.phone}">{enterprise.phone}</a>
            </Panel>
        </section>
    </div>
</article>

<!-- 
<article>
    <header>
        {#if onback}
            <button
                type="button"
                aria-label="Back to directory"
                onclick={onback}
            >
                <ArrowLeft size="28" />
            </button>
        {:else}
            <a href={resolve(`/`)}>
                <ArrowLeft size="28" />
            </a>
        {/if}
        <h2>{enterprise.name}</h2>
        <img src={enterprise.logoUrl} alt="logo" />
    </header>
    <div id="gallery">
        {#if enterprise.images[0]}
            <img src={enterprise.images[0]} />
        {:else}
            <div
                style="width:100%; height: 400px; background-color: lightgray;"
            >
                Photos coming soon
            </div>
        {/if}
    </div>
    <p class="location">
        <MapPin />
        {enterprise.addresses[0]?.formatted}
    </p>
    <div id="tags">
        {#each enterprise.categories as tag (tag)}
            <Tag text={tag} />
        {/each}
    </div>
    <p class="description">{enterprise.description}</p>

    {#if ENABLE_PRODUCTS === "true" && enterprise.products.length > 0}
        <section>
            {#each enterprise.products as product, index (index)}
                <CardProduct
                    {product}
                    link={resolve("/products/[id]", {
                        id: product.profileId,
                    })}
                    landscape={true}
                />
            {/each}
        </section>
    {/if}
</article> 
<style lang="scss">
    //article{
    //     position: fixed;
    //     display: flex;
    //     flex-direction: column;
    //     inset: 0;
    //     z-index: 10;
    //     background-color: $white;
    //     padding: $gap;
    //     gap: $gap;
    //     max-width: 1440px;
    //     margin: 0 auto;
    //     overflow: auto;

    //     header {
    //         display: flex;
    //         flex-direction: row;
    //         justify-content: space-between;
    //         align-items: center;

    //         a,
    //         button {
    //             padding: $gap-xsmall;
    //             color: $black;
    //         }

    //         button {
    //             background: none;
    //             border: none;
    //             display: flex;
    //         }

    //         img {
    //             min-width: 48px;
    //             height: 48px;
    //             object-fit: cover;
    //             object-position: center;
    //         }
    //     }

    //     p {
    //         display: flex;
    //         gap: $gap-xxsmall;

    //         &.location {
    //             text-decoration: underline;
    //         }

    //         &.description {
    //             font-size: $text-body-small;
    //         }
    //     }

    //     #tags {
    //         display: inline-flex;
    //         gap: $gap-xsmall;
    //         margin-top: $gap-xsmall;
    //     }
    // }

    // section {
    //     display: grid;
    //     gap: $gap-large;
    //     grid-template-columns: 1fr;
    //     grid-auto-rows: max-content;
    //     grid-area: 1 / 1;
    //     max-height: auto;
    //     z-index: 0;
    //     opacity: 1;

    //     @include from($breakpoint-small) {
    //         grid-template-columns: 1fr;
    //     }

    //     @include from($breakpoint-medium) {
    //         grid-template-columns: 1fr;
    //     }

    //     @include from($breakpoint-large) {
    //         grid-template-columns: 1fr 1fr;
    //     }
    //     @include from($breakpoint-xlarge) {
    //         grid-template-columns: 1fr 1fr 1fr;
    //     }
    //     @include from($breakpoint-xxlarge) {
    //         grid-template-columns: 1fr 1fr 1fr;
    //     }
    // }  
</style>
-->

<style lang="scss">
    article {
        position: fixed;

        flex-direction: column;
        inset: 0;
        z-index: 10;
        background-color: $white;
        padding: $gap;
        gap: $gap;
        max-width: 1440px;
        margin: 0 auto;
        overflow: auto;
        display: grid;
        grid-template-columns: 50px 1fr 50px;
        grid-template-rows: auto auto auto auto auto;
        grid-template-areas:
            "back title logo"
            "photo photo photo"
            "details details details"
            "buy buy buy"
            "deliver deliver deliver";

        @include from($breakpoint-medium) {
            grid-template-columns: 50px 1fr 1fr 50px;
            grid-template-rows: auto auto auto auto auto;
            grid-template-areas:
                "back . . ."
                "logo title title title"
                "photo photo details details"
                "buy buy buy buy"
                "deliver deliver deliver deliver";
        }
    }

    #how-to-buy {
        grid-area: buy;
        section {
            display: grid;
            gap: $gap;
            grid-template-columns: auto;
            @include from($breakpoint-medium) {
                grid-template-columns: 1fr 1fr 1fr;
            }
            a {
                color: $secondary;
            }
        }
    }
    #delivery-collection {
        grid-area: deliver;
        section {
            display: grid;
            gap: $gap;
            grid-template-columns: auto;
            @include from($breakpoint-medium) {
                grid-template-columns: 1fr 1fr 1fr;
            }

            a {
                color: $secondary;
            }
        }
    }
</style>
